package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"gigaboo.io/lem/internal/middleware"
	"gigaboo.io/lem/internal/services"
)

// GoogleOAuthHandler handles Google OAuth endpoints.
type GoogleOAuthHandler struct {
	googleOAuthService *services.GoogleOAuthService
	auth               *middleware.AuthMiddleware
}

// NewGoogleOAuthHandler creates a new Google OAuth handler.
func NewGoogleOAuthHandler(googleOAuthService *services.GoogleOAuthService, auth *middleware.AuthMiddleware) *GoogleOAuthHandler {
	return &GoogleOAuthHandler{
		googleOAuthService: googleOAuthService,
		auth:               auth,
	}
}

// AuthorizeInput represents authorization request.
type AuthorizeInput struct {
	RedirectURI string `json:"redirect_uri" binding:"required"`
	State       string `json:"state"`
}

// GoogleLoginInput represents Google ID token login request.
type GoogleLoginInput struct {
	IDToken string `json:"id_token" binding:"required"`
}

// Login handles Google Sign-In with ID token.
func (h *GoogleOAuthHandler) Login(c *gin.Context) {
	var input GoogleLoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	app := middleware.GetAppFromGin(c)
	if app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "app not found"})
		return
	}

	// Verify ID token and get/create user
	user, err := h.googleOAuthService.VerifyIDToken(c.Request.Context(), input.IDToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Ensure user-app association exists
	if err := h.googleOAuthService.EnsureUserApp(c.Request.Context(), user.ID, app.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to associate user with app"})
		return
	}

	// Generate JWT tokens
	accessToken, err := h.auth.GenerateAccessToken(user.ID, app.ID, 0, "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	refreshToken, err := h.auth.GenerateRefreshToken(user.ID, app.ID, 0)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"token_type":    "Bearer",
		"expires_in":    1800, // 30 minutes
		"user": gin.H{
			"id":          user.ID,
			"email":       user.Email,
			"name":        user.Name,
			"avatar_url":  user.AvatarURL,
			"is_active":   true,
			"is_verified": user.IsVerified,
			"created_at":  user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		},
	})
}

// Authorize returns the Google OAuth authorization URL.
func (h *GoogleOAuthHandler) Authorize(c *gin.Context) {
	var input AuthorizeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	url := h.googleOAuthService.GetAuthorizationURL(input.RedirectURI, input.State)
	c.JSON(http.StatusOK, gin.H{"url": url})
}

// Callback handles the Google OAuth callback.
func (h *GoogleOAuthHandler) Callback(c *gin.Context) {
	var input services.ExchangeCodeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	app := middleware.GetAppFromGin(c)
	if app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "app not found"})
		return
	}

	user, token, err := h.googleOAuthService.ExchangeCode(c.Request.Context(), input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Generate JWT tokens
	accessToken, err := h.auth.GenerateAccessToken(user.ID, app.ID, 0, "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	refreshToken, err := h.auth.GenerateRefreshToken(user.ID, app.ID, 0)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token":       accessToken,
		"refresh_token":      refreshToken,
		"token_type":         "Bearer",
		"google_token":       token.AccessToken,
		"google_expiry":      token.Expiry,
		"user":               user,
	})
}
