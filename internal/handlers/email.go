package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"gigaboo.io/lem/internal/middleware"
	"gigaboo.io/lem/internal/services"
)

// EmailHandler handles email endpoints.
type EmailHandler struct {
	emailService *services.EmailService
}

// NewEmailHandler creates a new email handler.
func NewEmailHandler(emailService *services.EmailService) *EmailHandler {
	return &EmailHandler{
		emailService: emailService,
	}
}

// SendEmailInput represents send email request.
type SendEmailInput struct {
	To           string            `json:"to" binding:"required,email"`
	Subject      string            `json:"subject" binding:"required"`
	TemplateName string            `json:"template_name"`
	Variables    map[string]string `json:"variables"`
	BodyHTML     string            `json:"body_html"`
	BodyText     string            `json:"body_text"`
}

// Send sends an email.
func (h *EmailHandler) Send(c *gin.Context) {
	app := middleware.GetAppFromGin(c)
	if app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	var input SendEmailInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var err error
	if input.TemplateName != "" {
		err = h.emailService.SendTemplateEmail(c.Request.Context(), app.ID, input.To, input.TemplateName, input.Variables)
	} else {
		err = h.emailService.SendRawEmail(c.Request.Context(), input.To, input.Subject, input.BodyHTML, input.BodyText)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"sent": true})
}

// ListTemplates lists all email templates.
func (h *EmailHandler) ListTemplates(c *gin.Context) {
	app := middleware.GetAppFromGin(c)
	if app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	templates, err := h.emailService.ListTemplates(c.Request.Context(), app.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"templates": templates})
}

// GetTemplate returns a single template.
func (h *EmailHandler) GetTemplate(c *gin.Context) {
	app := middleware.GetAppFromGin(c)
	if app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	name := c.Param("name")
	template, err := h.emailService.GetTemplate(c.Request.Context(), app.ID, name)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "template not found"})
		return
	}

	c.JSON(http.StatusOK, template)
}

// CreateTemplateInput represents create template request.
type CreateTemplateInput struct {
	Name        string   `json:"name" binding:"required"`
	Description string   `json:"description"`
	Subject     string   `json:"subject" binding:"required"`
	BodyHTML    string   `json:"body_html" binding:"required"`
	BodyText    string   `json:"body_text"`
	Variables   []string `json:"variables"`
}

// CreateTemplate creates a new email template.
func (h *EmailHandler) CreateTemplate(c *gin.Context) {
	app := middleware.GetAppFromGin(c)
	if app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	var input CreateTemplateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	template, err := h.emailService.CreateTemplate(c.Request.Context(), app.ID, services.CreateTemplateInput{
		Name:        input.Name,
		Description: input.Description,
		Subject:     input.Subject,
		BodyHTML:    input.BodyHTML,
		BodyText:    input.BodyText,
		Variables:   input.Variables,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, template)
}

// UpdateTemplateInput represents update template request.
type UpdateTemplateInput struct {
	Description *string  `json:"description"`
	Subject     *string  `json:"subject"`
	BodyHTML    *string  `json:"body_html"`
	BodyText    *string  `json:"body_text"`
	Variables   []string `json:"variables"`
}

// UpdateTemplate updates an email template.
func (h *EmailHandler) UpdateTemplate(c *gin.Context) {
	app := middleware.GetAppFromGin(c)
	if app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	name := c.Param("name")

	var input UpdateTemplateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	template, err := h.emailService.UpdateTemplate(c.Request.Context(), app.ID, name, services.UpdateTemplateInput{
		Description: input.Description,
		Subject:     input.Subject,
		BodyHTML:    input.BodyHTML,
		BodyText:    input.BodyText,
		Variables:   input.Variables,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, template)
}

// DeleteTemplate deletes an email template.
func (h *EmailHandler) DeleteTemplate(c *gin.Context) {
	app := middleware.GetAppFromGin(c)
	if app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	name := c.Param("name")

	if err := h.emailService.DeleteTemplate(c.Request.Context(), app.ID, name); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"deleted": true})
}
