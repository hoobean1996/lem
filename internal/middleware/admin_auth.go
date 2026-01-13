package middleware

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"google.golang.org/api/idtoken"

	"gigaboo.io/lem/internal/config"
	"gigaboo.io/lem/internal/ent"
)

const (
	// AdminCookieName is the name of the admin session cookie
	AdminCookieName = "admin_session"
	// AdminTokenExpireHours is the duration of admin session
	AdminTokenExpireHours = 24
)

// AdminContextKey is the key for admin user in context
const AdminContextKey contextKey = "admin"

// AdminClaims represents admin session JWT claims
type AdminClaims struct {
	jwt.RegisteredClaims
	Email string `json:"email"`
	Name  string `json:"name,omitempty"`
	Type  string `json:"type"` // "admin_session"
}

// AdminUser represents an authenticated admin user
type AdminUser struct {
	Email string
	Name  string
}

// AdminAuthMiddleware provides admin authentication middleware
type AdminAuthMiddleware struct {
	cfg    *config.Config
	client *ent.Client
}

// NewAdminAuthMiddleware creates a new admin auth middleware
func NewAdminAuthMiddleware(cfg *config.Config, client *ent.Client) *AdminAuthMiddleware {
	return &AdminAuthMiddleware{
		cfg:    cfg,
		client: client,
	}
}

// RequireAdmin validates admin session from cookie
func (m *AdminAuthMiddleware) RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie(AdminCookieName)
		if err != nil || token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"detail": "Admin authentication required"})
			return
		}

		claims, err := m.ValidateAdminToken(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"detail": "Invalid or expired admin session"})
			return
		}

		admin := &AdminUser{
			Email: claims.Email,
			Name:  claims.Name,
		}

		c.Set(string(AdminContextKey), admin)
		c.Next()
	}
}

// CreateAdminToken creates a signed JWT token for admin session
func (m *AdminAuthMiddleware) CreateAdminToken(email, name string) (string, error) {
	claims := AdminClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(AdminTokenExpireHours * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
		Email: email,
		Name:  name,
		Type:  "admin_session",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(m.cfg.JWTSecretKey))
}

// ValidateAdminToken validates and decodes admin session token
func (m *AdminAuthMiddleware) ValidateAdminToken(tokenString string) (*AdminClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &AdminClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(m.cfg.JWTSecretKey), nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*AdminClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	if claims.Type != "admin_session" {
		return nil, errors.New("invalid token type")
	}

	return claims, nil
}

// IsAdminEmail checks if email is in the admin allowlist
func (m *AdminAuthMiddleware) IsAdminEmail(email string) bool {
	if len(m.cfg.AdminEmails) == 0 {
		return false
	}
	email = strings.ToLower(email)
	for _, adminEmail := range m.cfg.AdminEmails {
		if strings.ToLower(adminEmail) == email {
			return true
		}
	}
	return false
}

// VerifyGoogleIDToken verifies Google ID token and extracts user info
func (m *AdminAuthMiddleware) VerifyGoogleIDToken(ctx context.Context, idToken string) (*AdminUser, error) {
	payload, err := idtoken.Validate(ctx, idToken, m.cfg.GoogleClientID)
	if err != nil {
		return nil, err
	}

	// Verify issuer
	iss, ok := payload.Claims["iss"].(string)
	if !ok || (iss != "accounts.google.com" && iss != "https://accounts.google.com") {
		return nil, errors.New("invalid issuer")
	}

	email, _ := payload.Claims["email"].(string)
	name, _ := payload.Claims["name"].(string)

	if email == "" {
		return nil, errors.New("email not found in token")
	}

	return &AdminUser{
		Email: email,
		Name:  name,
	}, nil
}

// IsProd returns true if running in production
func (m *AdminAuthMiddleware) IsProd() bool {
	return m.cfg.Env == "prod"
}

// GetAdminFromGin returns the admin user from gin context
func GetAdminFromGin(c *gin.Context) *AdminUser {
	if admin, exists := c.Get(string(AdminContextKey)); exists {
		return admin.(*AdminUser)
	}
	return nil
}
