package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"gigaboo.io/lem/internal/middleware"
	"gigaboo.io/lem/internal/services"
)

// AuthHandler handles authentication endpoints.
type AuthHandler struct {
	authService *services.AuthService
	auth        *middleware.AuthMiddleware
}

// NewAuthHandler creates a new auth handler.
func NewAuthHandler(authService *services.AuthService, auth *middleware.AuthMiddleware) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		auth:        auth,
	}
}

// Signup handles user registration.
func (h *AuthHandler) Signup(c *gin.Context) {
	var input services.SignupInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	app := middleware.GetAppFromGin(c)
	if app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "app not found"})
		return
	}

	resp, err := h.authService.Signup(c.Request.Context(), app.ID, input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, resp)
}

// Login handles user login.
func (h *AuthHandler) Login(c *gin.Context) {
	var input services.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	app := middleware.GetAppFromGin(c)
	if app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "app not found"})
		return
	}

	resp, err := h.authService.Login(c.Request.Context(), app.ID, input)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

// DeviceLogin handles device-based login.
func (h *AuthHandler) DeviceLogin(c *gin.Context) {
	var input services.DeviceLoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	app := middleware.GetAppFromGin(c)
	if app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "app not found"})
		return
	}

	resp, err := h.authService.DeviceLogin(c.Request.Context(), app.ID, input)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

// RefreshToken handles token refresh.
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var input services.RefreshTokenInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.authService.RefreshToken(c.Request.Context(), input)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

// GetMe returns the current user.
func (h *AuthHandler) GetMe(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}
