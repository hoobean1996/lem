package handlers

import (
	"bytes"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"

	"gigaboo.io/lem/internal/middleware"
	"gigaboo.io/lem/internal/services"
)

// SubscriptionHandler handles subscription endpoints.
type SubscriptionHandler struct {
	stripeService *services.StripeService
}

// NewSubscriptionHandler creates a new subscription handler.
func NewSubscriptionHandler(stripeService *services.StripeService) *SubscriptionHandler {
	return &SubscriptionHandler{
		stripeService: stripeService,
	}
}

// GetPlans returns available plans.
func (h *SubscriptionHandler) GetPlans(c *gin.Context) {
	app := middleware.GetAppFromGin(c)
	if app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "app not found"})
		return
	}

	plans, err := h.stripeService.GetPlans(c.Request.Context(), app.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"plans": plans})
}

// GetCurrentSubscription returns the user's current subscription.
func (h *SubscriptionHandler) GetCurrentSubscription(c *gin.Context) {
	app := middleware.GetAppFromGin(c)
	user := middleware.GetUserFromGin(c)
	if app == nil || user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	subscription, err := h.stripeService.GetCurrentSubscription(c.Request.Context(), app.ID, user.ID)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"subscription": nil})
		return
	}

	c.JSON(http.StatusOK, gin.H{"subscription": subscription})
}

// CreateCheckout creates a Stripe checkout session.
func (h *SubscriptionHandler) CreateCheckout(c *gin.Context) {
	var input services.CreateCheckoutInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	app := middleware.GetAppFromGin(c)
	user := middleware.GetUserFromGin(c)
	if app == nil || user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	session, err := h.stripeService.CreateCheckoutSession(c.Request.Context(), app.ID, user.ID, input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"session_id": session.ID,
		"url":        session.URL,
	})
}

// CreatePortalInput represents portal session request.
type CreatePortalInput struct {
	ReturnURL string `json:"return_url" binding:"required"`
}

// CreatePortal creates a Stripe billing portal session.
func (h *SubscriptionHandler) CreatePortal(c *gin.Context) {
	var input CreatePortalInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	app := middleware.GetAppFromGin(c)
	user := middleware.GetUserFromGin(c)
	if app == nil || user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	session, err := h.stripeService.CreatePortalSession(c.Request.Context(), app.ID, user.ID, input.ReturnURL)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"url": session.URL})
}

// HandleWebhook handles Stripe webhook events.
func (h *SubscriptionHandler) HandleWebhook(c *gin.Context) {
	signature := c.GetHeader("Stripe-Signature")
	if signature == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing signature"})
		return
	}

	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to read body"})
		return
	}

	// Create a reader from the body
	bodyReader := bytes.NewReader(body)

	err = h.stripeService.HandleWebhook(c.Request.Context(), bodyReader, signature)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"received": true})
}
