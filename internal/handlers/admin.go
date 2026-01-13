package handlers

import (
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"gigaboo.io/lem/internal/config"
	"gigaboo.io/lem/internal/ent"
	"gigaboo.io/lem/internal/ent/achievement"
	"gigaboo.io/lem/internal/ent/app"
	"gigaboo.io/lem/internal/ent/emailtemplate"
	"gigaboo.io/lem/internal/ent/organization"
	"gigaboo.io/lem/internal/ent/organizationmember"
	"gigaboo.io/lem/internal/ent/plan"
	"gigaboo.io/lem/internal/ent/shenbiprofile"
	"gigaboo.io/lem/internal/ent/subscription"
	"gigaboo.io/lem/internal/ent/user"
	"gigaboo.io/lem/internal/ent/userapp"
	"gigaboo.io/lem/internal/ent/userprogress"
	"gigaboo.io/lem/internal/middleware"
	"gigaboo.io/lem/internal/services"
)

// AdminHandler handles admin API requests.
type AdminHandler struct {
	cfg          *config.Config
	client       *ent.Client
	adminAuth    *middleware.AdminAuthMiddleware
	auth         *middleware.AuthMiddleware
	email        *services.EmailService
	storage      *services.StorageService
}

// NewAdminHandler creates a new admin handler.
func NewAdminHandler(
	cfg *config.Config,
	client *ent.Client,
	adminAuth *middleware.AdminAuthMiddleware,
	auth *middleware.AuthMiddleware,
	email *services.EmailService,
	storage *services.StorageService,
) *AdminHandler {
	return &AdminHandler{
		cfg:       cfg,
		client:    client,
		adminAuth: adminAuth,
		auth:      auth,
		email:     email,
		storage:   storage,
	}
}

// =============================================================================
// Authentication Routes
// =============================================================================

// GoogleAuthRequest represents Google Sign-In request.
type GoogleAuthRequest struct {
	IDToken string `json:"id_token" binding:"required"`
}

// GoogleAuth handles Google Sign-In for admin.
func (h *AdminHandler) GoogleAuth(c *gin.Context) {
	var req GoogleAuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid request"})
		return
	}

	// Verify Google ID token
	userInfo, err := h.adminAuth.VerifyGoogleIDToken(c.Request.Context(), req.IDToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Invalid Google token"})
		return
	}

	// Check if email is in admin allowlist
	if !h.adminAuth.IsAdminEmail(userInfo.Email) {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "error": fmt.Sprintf("Access denied. %s is not an authorized admin.", userInfo.Email)})
		return
	}

	// Create admin session token
	token, err := h.adminAuth.CreateAdminToken(userInfo.Email, userInfo.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to create session"})
		return
	}

	// Set cookie
	secure := h.adminAuth.IsProd()
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(
		middleware.AdminCookieName,
		token,
		86400, // 24 hours
		"/",
		"",
		secure,
		true, // httponly
	)

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// GetMe returns the current admin user.
func (h *AdminHandler) GetMe(c *gin.Context) {
	admin := middleware.GetAdminFromGin(c)
	if admin == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"detail": "Admin authentication required"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"email": admin.Email})
}

// Logout clears admin session.
func (h *AdminHandler) Logout(c *gin.Context) {
	c.SetCookie(
		middleware.AdminCookieName,
		"",
		-1,
		"/",
		"",
		false,
		true,
	)
	c.JSON(http.StatusOK, gin.H{"success": true})
}

// =============================================================================
// Apps API
// =============================================================================

// GetApps returns all apps.
func (h *AdminHandler) GetApps(c *gin.Context) {
	apps, err := h.client.App.Query().
		Order(ent.Desc(app.FieldCreatedAt)).
		All(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Failed to fetch apps"})
		return
	}

	result := make([]gin.H, len(apps))
	for i, a := range apps {
		result[i] = gin.H{
			"id":         a.ID,
			"name":       a.Name,
			"slug":       a.Slug,
			"created_at": a.CreatedAt.Format(time.RFC3339),
		}
	}

	c.JSON(http.StatusOK, gin.H{"apps": result})
}

// GetApp returns a single app.
func (h *AdminHandler) GetApp(c *gin.Context) {
	appID, err := strconv.Atoi(c.Param("app_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid app ID"})
		return
	}

	a, err := h.client.App.Get(c.Request.Context(), appID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "App not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":         a.ID,
		"name":       a.Name,
		"slug":       a.Slug,
		"created_at": a.CreatedAt.Format(time.RFC3339),
	})
}

// =============================================================================
// Users API
// =============================================================================

// GetAppUsers returns users for an app.
func (h *AdminHandler) GetAppUsers(c *gin.Context) {
	appID, err := strconv.Atoi(c.Param("app_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid app ID"})
		return
	}

	// Get app
	a, err := h.client.App.Get(c.Request.Context(), appID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "App not found"})
		return
	}

	// Get user apps with users using edge predicates
	userApps, err := h.client.UserApp.Query().
		Where(userapp.HasAppWith(app.ID(appID))).
		WithUser().
		WithApp().
		Order(ent.Desc(userapp.FieldEnabledAt)).
		All(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Failed to fetch users"})
		return
	}

	// Collect user IDs from edges
	userIDs := make([]int, 0, len(userApps))
	for _, ua := range userApps {
		if ua.Edges.User != nil {
			userIDs = append(userIDs, ua.Edges.User.ID)
		}
	}

	// Get subscriptions with edge predicates
	subscriptions, err := h.client.Subscription.Query().
		Where(
			subscription.HasAppWith(app.ID(appID)),
			subscription.HasUserWith(user.IDIn(userIDs...)),
		).
		WithPlan().
		WithUser().
		All(c.Request.Context())
	if err != nil {
		subscriptions = []*ent.Subscription{}
	}

	// Build subscription map by user ID
	subMap := make(map[int]*ent.Subscription)
	for _, s := range subscriptions {
		if s.Edges.User != nil {
			subMap[s.Edges.User.ID] = s
		}
	}

	// Check if Shenbi app
	isShenbiApp := a.Slug == "shenbi"
	profileMap := make(map[int]*ent.ShenbiProfile)
	if isShenbiApp && len(userIDs) > 0 {
		profiles, err := h.client.ShenbiProfile.Query().
			Where(
				shenbiprofile.HasAppWith(app.ID(appID)),
				shenbiprofile.HasUserWith(user.IDIn(userIDs...)),
			).
			WithUser().
			All(c.Request.Context())
		if err == nil {
			for _, p := range profiles {
				if p.Edges.User != nil {
					profileMap[p.Edges.User.ID] = p
				}
			}
		}
	}

	// Build response
	users := make([]gin.H, len(userApps))
	activeCount := 0
	paidCount := 0

	for i, ua := range userApps {
		u := ua.Edges.User
		if u == nil {
			continue
		}

		sub := subMap[u.ID]
		profile := profileMap[u.ID]

		userData := gin.H{
			"id":            u.ID,
			"email":         u.Email,
			"name":          u.Name,
			"device_id":     u.DeviceID,
			"last_login_at": nil,
		}
		if u.LastLoginAt != nil {
			userData["last_login_at"] = u.LastLoginAt.Format(time.RFC3339)
		}

		userAppData := gin.H{
			"user_id":    u.ID,
			"app_id":     appID,
			"enabled_at": ua.EnabledAt.Format(time.RFC3339),
		}

		var subData gin.H
		if sub != nil {
			subData = gin.H{
				"id":      sub.ID,
				"user_id": u.ID,
				"status":  sub.Status,
				"plan":    nil,
			}
			if sub.Edges.Plan != nil {
				p := sub.Edges.Plan
				subData["plan"] = gin.H{
					"id":          p.ID,
					"name":        p.Name,
					"price_cents": p.PriceCents,
				}
				if p.PriceCents > 0 && sub.Status == subscription.StatusACTIVE {
					paidCount++
				}
			}
			if sub.Status == subscription.StatusACTIVE {
				activeCount++
			}
		}

		var profileData gin.H
		if profile != nil {
			profileData = gin.H{
				"id":           profile.ID,
				"user_id":      u.ID,
				"role":         profile.Role,
				"display_name": profile.DisplayName,
				"grade":        profile.Grade,
				"age":          profile.Age,
			}
		}

		users[i] = gin.H{
			"user":           userData,
			"user_app":       userAppData,
			"subscription":   subData,
			"shenbi_profile": profileData,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"users":         users,
		"is_shenbi_app": isShenbiApp,
		"active_count":  activeCount,
		"paid_count":    paidCount,
	})
}

// =============================================================================
// Shenbi Role
// =============================================================================

// UpdateShenbiRoleRequest represents role update request.
type UpdateShenbiRoleRequest struct {
	Role string `json:"role" binding:"required"`
}

// UpdateShenbiRole updates a user's Shenbi profile role.
func (h *AdminHandler) UpdateShenbiRole(c *gin.Context) {
	appID, err := strconv.Atoi(c.Param("app_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid app ID"})
		return
	}

	userID, err := strconv.Atoi(c.Param("user_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid user ID"})
		return
	}

	var req UpdateShenbiRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid request"})
		return
	}

	// Validate role
	validRoles := []string{"STUDENT", "TEACHER", "ADMIN"}
	roleUpper := strings.ToUpper(req.Role)
	valid := false
	for _, r := range validRoles {
		if r == roleUpper {
			valid = true
			break
		}
	}
	if !valid {
		c.JSON(http.StatusBadRequest, gin.H{"detail": fmt.Sprintf("Invalid role. Must be one of: %v", validRoles)})
		return
	}

	// Find profile
	profile, err := h.client.ShenbiProfile.Query().
		Where(
			shenbiprofile.HasAppWith(app.ID(appID)),
			shenbiprofile.HasUserWith(user.ID(userID)),
		).
		First(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Shenbi profile not found"})
		return
	}

	// Update role
	_, err = h.client.ShenbiProfile.UpdateOne(profile).
		SetRole(shenbiprofile.Role(roleUpper)).
		Save(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Failed to update role"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "role": roleUpper})
}

// =============================================================================
// Generate Token
// =============================================================================

// GenerateToken generates JWT tokens for a user.
func (h *AdminHandler) GenerateToken(c *gin.Context) {
	appID, err := strconv.Atoi(c.Param("app_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid app ID"})
		return
	}

	userID, err := strconv.Atoi(c.Param("user_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid user ID"})
		return
	}

	// Verify app exists
	_, err = h.client.App.Get(c.Request.Context(), appID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "App not found"})
		return
	}

	// Verify user exists
	_, err = h.client.User.Get(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "User not found"})
		return
	}

	// Generate tokens
	accessToken, err := h.auth.GenerateAccessToken(userID, appID, 0, "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Failed to generate access token"})
		return
	}

	refreshToken, err := h.auth.GenerateRefreshToken(userID, appID, 0)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Failed to generate refresh token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"expires_in":    h.cfg.AccessTokenExpireMinutes * 60,
	})
}

// =============================================================================
// Reset Progress
// =============================================================================

// ResetProgress resets all progress and achievements for a user.
func (h *AdminHandler) ResetProgress(c *gin.Context) {
	appID, err := strconv.Atoi(c.Param("app_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid app ID"})
		return
	}

	userID, err := strconv.Atoi(c.Param("user_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid user ID"})
		return
	}

	// Verify app exists
	_, err = h.client.App.Get(c.Request.Context(), appID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "App not found"})
		return
	}

	// Verify user exists
	_, err = h.client.User.Get(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "User not found"})
		return
	}

	// Delete progress
	progressDeleted, err := h.client.UserProgress.Delete().
		Where(
			userprogress.HasAppWith(app.ID(appID)),
			userprogress.HasUserWith(user.ID(userID)),
		).
		Exec(c.Request.Context())
	if err != nil {
		progressDeleted = 0
	}

	// Delete achievements
	achievementsDeleted, err := h.client.Achievement.Delete().
		Where(
			achievement.HasAppWith(app.ID(appID)),
			achievement.HasUserWith(user.ID(userID)),
		).
		Exec(c.Request.Context())
	if err != nil {
		achievementsDeleted = 0
	}

	c.JSON(http.StatusOK, gin.H{
		"success":              true,
		"progress_deleted":     progressDeleted,
		"achievements_deleted": achievementsDeleted,
	})
}

// =============================================================================
// Send Email
// =============================================================================

// SendEmailRequest represents send email request.
type SendEmailRequest struct {
	Subject string `json:"subject" binding:"required"`
	Body    string `json:"body" binding:"required"`
}

// SendEmail sends an email to a user.
func (h *AdminHandler) SendEmail(c *gin.Context) {
	appID, err := strconv.Atoi(c.Param("app_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid app ID"})
		return
	}

	userID, err := strconv.Atoi(c.Param("user_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid user ID"})
		return
	}

	var req SendEmailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid request"})
		return
	}

	// Get user
	u, err := h.client.User.Get(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "User not found"})
		return
	}

	if u.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "User has no email address"})
		return
	}

	// Send email
	bodyHTML := strings.ReplaceAll(req.Body, "\n", "<br>")
	err = h.email.SendRawEmail(c.Request.Context(), u.Email, req.Subject, bodyHTML, req.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Failed to send email: " + err.Error()})
		return
	}

	_ = appID // Not needed for raw email

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// SendTemplateEmailRequest represents send template email request.
type SendTemplateEmailRequest struct {
	TemplateName string            `json:"template_name" binding:"required"`
	Variables    map[string]string `json:"variables"`
}

// SendTemplateEmail sends a templated email to a user.
func (h *AdminHandler) SendTemplateEmail(c *gin.Context) {
	appID, err := strconv.Atoi(c.Param("app_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid app ID"})
		return
	}

	userID, err := strconv.Atoi(c.Param("user_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid user ID"})
		return
	}

	var req SendTemplateEmailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid request"})
		return
	}

	// Get user
	u, err := h.client.User.Get(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "User not found"})
		return
	}

	if u.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "User has no email address"})
		return
	}

	// Auto-fill variables
	variables := req.Variables
	if variables == nil {
		variables = make(map[string]string)
	}
	if _, ok := variables["recipient_name"]; !ok && u.Name != "" {
		variables["recipient_name"] = u.Name
	}
	if _, ok := variables["email"]; !ok {
		variables["email"] = u.Email
	}

	// Send template email
	err = h.email.SendTemplateEmail(c.Request.Context(), appID, u.Email, req.TemplateName, variables)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Failed to send email: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// =============================================================================
// Email Templates
// =============================================================================

// GetEmailTemplates returns all email templates for an app.
func (h *AdminHandler) GetEmailTemplates(c *gin.Context) {
	appID, err := strconv.Atoi(c.Param("app_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid app ID"})
		return
	}

	templates, err := h.client.EmailTemplate.Query().
		Where(emailtemplate.HasAppWith(app.ID(appID))).
		All(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Failed to fetch email templates"})
		return
	}

	result := make([]gin.H, len(templates))
	for i, t := range templates {
		result[i] = gin.H{
			"id":          t.ID,
			"name":        t.Name,
			"description": t.Description,
			"subject":     t.Subject,
			"variables":   t.Variables,
		}
	}

	c.JSON(http.StatusOK, gin.H{"templates": result})
}

// GetEmailTemplate returns a single email template.
func (h *AdminHandler) GetEmailTemplate(c *gin.Context) {
	appID, err := strconv.Atoi(c.Param("app_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid app ID"})
		return
	}

	templateID, err := strconv.Atoi(c.Param("template_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid template ID"})
		return
	}

	t, err := h.client.EmailTemplate.Query().
		Where(
			emailtemplate.ID(templateID),
			emailtemplate.HasAppWith(app.ID(appID)),
		).
		First(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Template not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":          t.ID,
		"name":        t.Name,
		"description": t.Description,
		"subject":     t.Subject,
		"body_html":   t.BodyHTML,
		"body_text":   t.BodyText,
		"variables":   t.Variables,
	})
}

// CreateEmailTemplateRequest represents create email template request.
type CreateEmailTemplateRequest struct {
	Name        string   `json:"name" binding:"required"`
	Description string   `json:"description"`
	Subject     string   `json:"subject" binding:"required"`
	BodyHTML    string   `json:"body_html" binding:"required"`
	BodyText    string   `json:"body_text"`
	Variables   []string `json:"variables"`
}

// CreateEmailTemplate creates a new email template.
func (h *AdminHandler) CreateEmailTemplate(c *gin.Context) {
	appID, err := strconv.Atoi(c.Param("app_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid app ID"})
		return
	}

	var req CreateEmailTemplateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid request"})
		return
	}

	// Check if template exists
	exists, err := h.client.EmailTemplate.Query().
		Where(
			emailtemplate.Name(req.Name),
			emailtemplate.HasAppWith(app.ID(appID)),
		).
		Exist(c.Request.Context())
	if err == nil && exists {
		c.JSON(http.StatusBadRequest, gin.H{"detail": fmt.Sprintf("Template with name '%s' already exists", req.Name)})
		return
	}

	t, err := h.client.EmailTemplate.Create().
		SetAppID(appID).
		SetName(req.Name).
		SetDescription(req.Description).
		SetSubject(req.Subject).
		SetBodyHTML(req.BodyHTML).
		SetBodyText(req.BodyText).
		SetVariables(req.Variables).
		Save(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Failed to create template"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"id": t.ID})
}

// UpdateEmailTemplateRequest represents update email template request.
type UpdateEmailTemplateRequest struct {
	Description *string  `json:"description"`
	Subject     *string  `json:"subject"`
	BodyHTML    *string  `json:"body_html"`
	BodyText    *string  `json:"body_text"`
	Variables   []string `json:"variables"`
}

// UpdateEmailTemplate updates an email template.
func (h *AdminHandler) UpdateEmailTemplate(c *gin.Context) {
	appID, err := strconv.Atoi(c.Param("app_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid app ID"})
		return
	}

	templateID, err := strconv.Atoi(c.Param("template_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid template ID"})
		return
	}

	var req UpdateEmailTemplateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid request"})
		return
	}

	// Get template
	t, err := h.client.EmailTemplate.Query().
		Where(
			emailtemplate.ID(templateID),
			emailtemplate.HasAppWith(app.ID(appID)),
		).
		First(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Template not found"})
		return
	}

	// Update template
	update := h.client.EmailTemplate.UpdateOne(t)
	if req.Description != nil {
		update.SetDescription(*req.Description)
	}
	if req.Subject != nil {
		update.SetSubject(*req.Subject)
	}
	if req.BodyHTML != nil {
		update.SetBodyHTML(*req.BodyHTML)
	}
	if req.BodyText != nil {
		update.SetBodyText(*req.BodyText)
	}
	if req.Variables != nil {
		update.SetVariables(req.Variables)
	}

	_, err = update.Save(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Failed to update template"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"id": t.ID})
}

// DeleteEmailTemplate deletes an email template.
func (h *AdminHandler) DeleteEmailTemplate(c *gin.Context) {
	appID, err := strconv.Atoi(c.Param("app_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid app ID"})
		return
	}

	templateID, err := strconv.Atoi(c.Param("template_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid template ID"})
		return
	}

	// Delete template
	_, err = h.client.EmailTemplate.Delete().
		Where(
			emailtemplate.ID(templateID),
			emailtemplate.HasAppWith(app.ID(appID)),
		).
		Exec(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Template not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// =============================================================================
// Plans
// =============================================================================

// GetPlans returns all plans for an app.
func (h *AdminHandler) GetPlans(c *gin.Context) {
	appID, err := strconv.Atoi(c.Param("app_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid app ID"})
		return
	}

	plans, err := h.client.Plan.Query().
		Where(plan.HasAppWith(app.ID(appID))).
		Order(ent.Asc(plan.FieldCreatedAt)).
		All(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Failed to fetch plans"})
		return
	}

	result := make([]gin.H, len(plans))
	for i, p := range plans {
		result[i] = gin.H{
			"id":               p.ID,
			"name":             p.Name,
			"slug":             p.Slug,
			"description":      p.Description,
			"price_cents":      p.PriceCents,
			"currency":         p.Currency,
			"billing_interval": strings.ToLower(string(p.BillingInterval)),
			"stripe_price_id":  p.StripePriceID,
			"features":         p.Features,
			"is_active":        p.IsActive,
			"is_default":       p.IsDefault,
			"created_at":       p.CreatedAt.Format(time.RFC3339),
		}
	}

	c.JSON(http.StatusOK, gin.H{"plans": result})
}

// CreatePlanRequest represents create plan request.
type CreatePlanRequest struct {
	Name            string `json:"name" binding:"required"`
	Slug            string `json:"slug" binding:"required"`
	Description     string `json:"description"`
	PriceCents      int    `json:"price_cents"`
	Currency        string `json:"currency"`
	BillingInterval string `json:"billing_interval"`
	StripePriceID   string `json:"stripe_price_id"`
	Features        string `json:"features"`
	IsDefault       bool   `json:"is_default"`
}

// CreatePlan creates a new plan.
func (h *AdminHandler) CreatePlan(c *gin.Context) {
	appID, err := strconv.Atoi(c.Param("app_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid app ID"})
		return
	}

	var req CreatePlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid request"})
		return
	}

	// Default values
	if req.Currency == "" {
		req.Currency = "USD"
	}
	if req.BillingInterval == "" {
		req.BillingInterval = "MONTHLY"
	}

	// Parse billing interval
	billingInterval := plan.BillingInterval(strings.ToUpper(req.BillingInterval))

	p, err := h.client.Plan.Create().
		SetAppID(appID).
		SetName(req.Name).
		SetSlug(req.Slug).
		SetDescription(req.Description).
		SetPriceCents(req.PriceCents).
		SetCurrency(req.Currency).
		SetBillingInterval(billingInterval).
		SetStripePriceID(req.StripePriceID).
		SetIsDefault(req.IsDefault).
		Save(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Failed to create plan: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"id": p.ID})
}

// UpdatePlanRequest represents update plan request.
type UpdatePlanRequest struct {
	Name            *string `json:"name"`
	Slug            *string `json:"slug"`
	Description     *string `json:"description"`
	PriceCents      *int    `json:"price_cents"`
	Currency        *string `json:"currency"`
	BillingInterval *string `json:"billing_interval"`
	StripePriceID   *string `json:"stripe_price_id"`
	IsActive        *bool   `json:"is_active"`
	IsDefault       *bool   `json:"is_default"`
}

// UpdatePlan updates a plan.
func (h *AdminHandler) UpdatePlan(c *gin.Context) {
	appID, err := strconv.Atoi(c.Param("app_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid app ID"})
		return
	}

	planID, err := strconv.Atoi(c.Param("plan_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid plan ID"})
		return
	}

	var req UpdatePlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid request"})
		return
	}

	// Get plan
	p, err := h.client.Plan.Query().
		Where(plan.ID(planID), plan.HasAppWith(app.ID(appID))).
		First(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Plan not found"})
		return
	}

	// Update plan
	update := h.client.Plan.UpdateOne(p)
	if req.Name != nil {
		update.SetName(*req.Name)
	}
	if req.Slug != nil {
		update.SetSlug(*req.Slug)
	}
	if req.Description != nil {
		update.SetDescription(*req.Description)
	}
	if req.PriceCents != nil {
		update.SetPriceCents(*req.PriceCents)
	}
	if req.Currency != nil {
		update.SetCurrency(*req.Currency)
	}
	if req.BillingInterval != nil {
		update.SetBillingInterval(plan.BillingInterval(strings.ToUpper(*req.BillingInterval)))
	}
	if req.StripePriceID != nil {
		update.SetStripePriceID(*req.StripePriceID)
	}
	if req.IsActive != nil {
		update.SetIsActive(*req.IsActive)
	}
	if req.IsDefault != nil {
		update.SetIsDefault(*req.IsDefault)
	}

	_, err = update.Save(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Failed to update plan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "id": p.ID})
}

// DeletePlan deletes a plan.
func (h *AdminHandler) DeletePlan(c *gin.Context) {
	appID, err := strconv.Atoi(c.Param("app_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid app ID"})
		return
	}

	planID, err := strconv.Atoi(c.Param("plan_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid plan ID"})
		return
	}

	// Delete plan
	_, err = h.client.Plan.Delete().
		Where(plan.ID(planID), plan.HasAppWith(app.ID(appID))).
		Exec(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Plan not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// =============================================================================
// Organizations
// =============================================================================

// GetOrganizations returns all organizations for an app.
func (h *AdminHandler) GetOrganizations(c *gin.Context) {
	appID, err := strconv.Atoi(c.Param("app_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid app ID"})
		return
	}

	orgs, err := h.client.Organization.Query().
		Where(organization.HasAppWith(app.ID(appID))).
		Order(ent.Desc(organization.FieldCreatedAt)).
		All(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Failed to fetch organizations"})
		return
	}

	// Get member counts
	orgIDs := make([]int, len(orgs))
	for i, o := range orgs {
		orgIDs[i] = o.ID
	}

	memberCounts := make(map[int]int)
	if len(orgIDs) > 0 {
		members, _ := h.client.OrganizationMember.Query().
			Where(organizationmember.HasOrganizationWith(organization.IDIn(orgIDs...))).
			WithOrganization().
			All(c.Request.Context())
		for _, m := range members {
			if m.Edges.Organization != nil {
				memberCounts[m.Edges.Organization.ID]++
			}
		}
	}

	result := make([]gin.H, len(orgs))
	for i, o := range orgs {
		result[i] = gin.H{
			"id":           o.ID,
			"name":         o.Name,
			"slug":         o.Slug,
			"description":  o.Description,
			"is_active":    o.IsActive,
			"member_count": memberCounts[o.ID],
			"created_at":   o.CreatedAt.Format(time.RFC3339),
		}
	}

	c.JSON(http.StatusOK, gin.H{"organizations": result})
}

// CreateOrganizationRequest represents create organization request.
type CreateOrganizationRequest struct {
	Name        string `json:"name" binding:"required"`
	Slug        string `json:"slug" binding:"required"`
	Description string `json:"description"`
}

// CreateOrganization creates a new organization.
func (h *AdminHandler) CreateOrganization(c *gin.Context) {
	appID, err := strconv.Atoi(c.Param("app_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid app ID"})
		return
	}

	var req CreateOrganizationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid request"})
		return
	}

	// Check if slug exists
	exists, err := h.client.Organization.Query().
		Where(organization.HasAppWith(app.ID(appID)), organization.Slug(req.Slug)).
		Exist(c.Request.Context())
	if err == nil && exists {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Organization with this slug already exists"})
		return
	}

	o, err := h.client.Organization.Create().
		SetAppID(appID).
		SetName(req.Name).
		SetSlug(req.Slug).
		SetDescription(req.Description).
		Save(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Failed to create organization"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":   o.ID,
		"name": o.Name,
		"slug": o.Slug,
	})
}

// UpdateOrganizationRequest represents update organization request.
type UpdateOrganizationRequest struct {
	Name        string `json:"name" binding:"required"`
	Slug        string `json:"slug" binding:"required"`
	Description string `json:"description"`
}

// UpdateOrganization updates an organization.
func (h *AdminHandler) UpdateOrganization(c *gin.Context) {
	appID, err := strconv.Atoi(c.Param("app_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid app ID"})
		return
	}

	orgID, err := strconv.Atoi(c.Param("org_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid organization ID"})
		return
	}

	var req UpdateOrganizationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid request"})
		return
	}

	// Get organization
	o, err := h.client.Organization.Query().
		Where(organization.ID(orgID), organization.HasAppWith(app.ID(appID))).
		First(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Organization not found"})
		return
	}

	// Check if new slug conflicts
	if req.Slug != o.Slug {
		exists, err := h.client.Organization.Query().
			Where(
				organization.HasAppWith(app.ID(appID)),
				organization.Slug(req.Slug),
				organization.IDNEQ(orgID),
			).
			Exist(c.Request.Context())
		if err == nil && exists {
			c.JSON(http.StatusBadRequest, gin.H{"detail": "Organization with this slug already exists"})
			return
		}
	}

	// Update
	_, err = h.client.Organization.UpdateOne(o).
		SetName(req.Name).
		SetSlug(req.Slug).
		SetDescription(req.Description).
		Save(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Failed to update organization"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "id": o.ID})
}

// ToggleOrganizationStatus toggles organization active status.
func (h *AdminHandler) ToggleOrganizationStatus(c *gin.Context) {
	appID, err := strconv.Atoi(c.Param("app_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid app ID"})
		return
	}

	orgID, err := strconv.Atoi(c.Param("org_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid organization ID"})
		return
	}

	// Get organization
	o, err := h.client.Organization.Query().
		Where(organization.ID(orgID), organization.HasAppWith(app.ID(appID))).
		First(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Organization not found"})
		return
	}

	// Toggle status
	newStatus := !o.IsActive
	_, err = h.client.Organization.UpdateOne(o).
		SetIsActive(newStatus).
		Save(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Failed to toggle organization status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "is_active": newStatus})
}

// DeleteOrganization deletes an organization.
func (h *AdminHandler) DeleteOrganization(c *gin.Context) {
	appID, err := strconv.Atoi(c.Param("app_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid app ID"})
		return
	}

	orgID, err := strconv.Atoi(c.Param("org_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid organization ID"})
		return
	}

	// Delete organization
	err = h.client.Organization.DeleteOneID(orgID).Exec(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Organization not found"})
		return
	}

	_ = appID

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// =============================================================================
// Storage
// =============================================================================

// GetStorageFiles lists files in storage.
func (h *AdminHandler) GetStorageFiles(c *gin.Context) {
	appID, err := strconv.Atoi(c.Param("app_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid app ID"})
		return
	}

	folder := c.DefaultQuery("folder", "shared")
	prefix := fmt.Sprintf("app_%d/%s/", appID, folder)

	files, err := h.storage.ListFiles(c.Request.Context(), prefix)
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"detail": err.Error()})
		return
	}

	result := make([]gin.H, len(files))
	for i, f := range files {
		result[i] = gin.H{
			"path":     f,
			"filename": f[len(prefix):],
		}
	}

	c.JSON(http.StatusOK, gin.H{"files": result, "count": len(files)})
}

// UploadStorageFile uploads a file to storage.
func (h *AdminHandler) UploadStorageFile(c *gin.Context) {
	appID, err := strconv.Atoi(c.Param("app_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid app ID"})
		return
	}

	folder := c.DefaultQuery("folder", "shared")

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "No file provided"})
		return
	}
	defer file.Close()

	// Read file content
	content, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Failed to read file"})
		return
	}

	// Upload to storage
	path := fmt.Sprintf("app_%d/%s/%s", appID, folder, header.Filename)
	err = h.storage.Upload(c.Request.Context(), path, strings.NewReader(string(content)), header.Header.Get("Content-Type"))
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"path":         path,
		"filename":     header.Filename,
		"size":         len(content),
		"content_type": header.Header.Get("Content-Type"),
	})
}

// GetStorageSignedURL gets a signed URL for a file.
func (h *AdminHandler) GetStorageSignedURL(c *gin.Context) {
	appID, err := strconv.Atoi(c.Param("app_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid app ID"})
		return
	}

	path := c.Query("path")
	if path == "" {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Path required"})
		return
	}

	// Security check
	if !strings.HasPrefix(path, fmt.Sprintf("app_%d/", appID)) {
		c.JSON(http.StatusForbidden, gin.H{"detail": "Access denied"})
		return
	}

	url, err := h.storage.GenerateSignedURL(c.Request.Context(), path, 60*time.Minute)
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"url": url, "expires_in_minutes": 60})
}

// DeleteStorageFile deletes a file from storage.
func (h *AdminHandler) DeleteStorageFile(c *gin.Context) {
	appID, err := strconv.Atoi(c.Param("app_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Invalid app ID"})
		return
	}

	path := c.Query("path")
	if path == "" {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Path required"})
		return
	}

	// Security check
	if !strings.HasPrefix(path, fmt.Sprintf("app_%d/", appID)) {
		c.JSON(http.StatusForbidden, gin.H{"detail": "Access denied"})
		return
	}

	err = h.storage.Delete(c.Request.Context(), path)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "File not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
