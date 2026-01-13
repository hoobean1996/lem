package middleware

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"gigaboo.io/lem/internal/config"
	"gigaboo.io/lem/internal/ent"
	"gigaboo.io/lem/internal/ent/app"
)

// Context keys
type contextKey string

const (
	AppContextKey  contextKey = "app"
	UserContextKey contextKey = "user"
	OrgContextKey  contextKey = "org"
)

// TokenClaims represents JWT claims.
type TokenClaims struct {
	jwt.RegisteredClaims
	UserID  int    `json:"user_id,omitempty"`
	AppID   int    `json:"app_id,omitempty"`
	OrgID   int    `json:"org_id,omitempty"`
	OrgRole string `json:"org_role,omitempty"`
	Type    string `json:"type"` // "access" or "refresh"
}

// AuthMiddleware provides authentication middleware.
type AuthMiddleware struct {
	cfg    *config.Config
	client *ent.Client
}

// NewAuthMiddleware creates a new auth middleware.
func NewAuthMiddleware(cfg *config.Config, client *ent.Client) *AuthMiddleware {
	return &AuthMiddleware{
		cfg:    cfg,
		client: client,
	}
}

// APIKeyAuth validates API key from X-API-Key header.
func (m *AuthMiddleware) APIKeyAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := c.GetHeader("X-API-Key")
		if apiKey == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "API key required"})
			return
		}

		// Find app by API key
		foundApp, err := m.client.App.Query().
			Where(app.APIKey(apiKey)).
			First(c.Request.Context())

		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid API key"})
			return
		}

		if !foundApp.IsActive {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "App is disabled"})
			return
		}

		// Store app in context
		c.Set(string(AppContextKey), foundApp)
		c.Next()
	}
}

// JWTAuth validates JWT token from Authorization header.
func (m *AuthMiddleware) JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			return
		}

		// Extract token
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization format"})
			return
		}

		tokenString := parts[1]

		// Parse and validate token
		claims, err := m.ValidateToken(tokenString)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token: " + err.Error()})
			return
		}

		// Check token type
		if claims.Type != "access" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token type"})
			return
		}

		// Get user from database
		user, err := m.client.User.Get(c.Request.Context(), claims.UserID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			return
		}

		if !user.IsActive {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "User is disabled"})
			return
		}

		// Store user and claims in context
		c.Set(string(UserContextKey), user)
		c.Set("claims", claims)
		c.Next()
	}
}

// OptionalJWTAuth validates JWT token if present but doesn't require it.
func (m *AuthMiddleware) OptionalJWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.Next()
			return
		}

		tokenString := parts[1]
		claims, err := m.ValidateToken(tokenString)
		if err != nil {
			c.Next()
			return
		}

		if claims.Type != "access" {
			c.Next()
			return
		}

		user, err := m.client.User.Get(c.Request.Context(), claims.UserID)
		if err != nil || !user.IsActive {
			c.Next()
			return
		}

		c.Set(string(UserContextKey), user)
		c.Set("claims", claims)
		c.Next()
	}
}

// GenerateAccessToken generates a new access token.
func (m *AuthMiddleware) GenerateAccessToken(userID, appID int, orgID int, orgRole string) (string, error) {
	claims := TokenClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(m.cfg.AccessTokenDuration())),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
		UserID:  userID,
		AppID:   appID,
		OrgID:   orgID,
		OrgRole: orgRole,
		Type:    "access",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(m.cfg.JWTSecretKey))
}

// GenerateRefreshToken generates a new refresh token.
func (m *AuthMiddleware) GenerateRefreshToken(userID, appID int, orgID int) (string, error) {
	claims := TokenClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(m.cfg.RefreshTokenDuration())),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
		UserID: userID,
		AppID:  appID,
		OrgID:  orgID,
		Type:   "refresh",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(m.cfg.JWTSecretKey))
}

// ValidateToken validates a JWT token and returns claims.
func (m *AuthMiddleware) ValidateToken(tokenString string) (*TokenClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &TokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(m.cfg.JWTSecretKey), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*TokenClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

// GetApp returns the app from context.
func GetApp(ctx context.Context) *ent.App {
	if app, ok := ctx.Value(AppContextKey).(*ent.App); ok {
		return app
	}
	return nil
}

// GetUser returns the user from context.
func GetUser(ctx context.Context) *ent.User {
	if user, ok := ctx.Value(UserContextKey).(*ent.User); ok {
		return user
	}
	return nil
}

// GetAppFromGin returns the app from gin context.
func GetAppFromGin(c *gin.Context) *ent.App {
	if app, exists := c.Get(string(AppContextKey)); exists {
		return app.(*ent.App)
	}
	return nil
}

// GetUserFromGin returns the user from gin context.
func GetUserFromGin(c *gin.Context) *ent.User {
	if user, exists := c.Get(string(UserContextKey)); exists {
		return user.(*ent.User)
	}
	return nil
}

// GetClaimsFromGin returns the token claims from gin context.
func GetClaimsFromGin(c *gin.Context) *TokenClaims {
	if claims, exists := c.Get("claims"); exists {
		return claims.(*TokenClaims)
	}
	return nil
}
