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
