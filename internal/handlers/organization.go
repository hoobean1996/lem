package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"gigaboo.io/lem/internal/middleware"
	"gigaboo.io/lem/internal/services"
)

// OrganizationHandler handles organization endpoints.
type OrganizationHandler struct {
	orgService *services.OrganizationService
}

// NewOrganizationHandler creates a new organization handler.
func NewOrganizationHandler(orgService *services.OrganizationService) *OrganizationHandler {
	return &OrganizationHandler{
		orgService: orgService,
	}
}

// List lists all organizations for current user.
func (h *OrganizationHandler) List(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	app := middleware.GetAppFromGin(c)
	if user == nil || app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	orgs, err := h.orgService.ListByUser(c.Request.Context(), user.ID, app.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"organizations": orgs})
}

// Get returns a single organization.
func (h *OrganizationHandler) Get(c *gin.Context) {
	orgID, err := strconv.Atoi(c.Param("org_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid organization id"})
		return
	}

	org, err := h.orgService.GetByID(c.Request.Context(), orgID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "organization not found"})
		return
	}

	c.JSON(http.StatusOK, org)
}

// Create creates a new organization.
func (h *OrganizationHandler) Create(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	app := middleware.GetAppFromGin(c)
	if user == nil || app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	var input services.CreateOrganizationInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	org, err := h.orgService.Create(c.Request.Context(), app.ID, user.ID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, org)
}

// Update updates an organization.
func (h *OrganizationHandler) Update(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	orgID, err := strconv.Atoi(c.Param("org_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid organization id"})
		return
	}

	// Check if user is admin
	isAdmin, err := h.orgService.IsAdmin(c.Request.Context(), orgID, user.ID)
	if err != nil || !isAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "permission denied"})
		return
	}

	var input services.UpdateOrganizationInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	org, err := h.orgService.Update(c.Request.Context(), orgID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, org)
}

// Delete deletes an organization.
func (h *OrganizationHandler) Delete(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	orgID, err := strconv.Atoi(c.Param("org_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid organization id"})
		return
	}

	// Check if user is owner
	isOwner, err := h.orgService.IsOwner(c.Request.Context(), orgID, user.ID)
	if err != nil || !isOwner {
		c.JSON(http.StatusForbidden, gin.H{"error": "only owner can delete organization"})
		return
	}

	if err := h.orgService.Delete(c.Request.Context(), orgID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// ListMembers lists all members of an organization.
func (h *OrganizationHandler) ListMembers(c *gin.Context) {
	orgID, err := strconv.Atoi(c.Param("org_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid organization id"})
		return
	}

	members, err := h.orgService.GetMembers(c.Request.Context(), orgID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"members": members})
}

// RemoveMember removes a member from organization.
func (h *OrganizationHandler) RemoveMember(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	orgID, err := strconv.Atoi(c.Param("org_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid organization id"})
		return
	}

	memberID, err := strconv.Atoi(c.Param("member_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid member id"})
		return
	}

	// Check if user is admin
	isAdmin, err := h.orgService.IsAdmin(c.Request.Context(), orgID, user.ID)
	if err != nil || !isAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "permission denied"})
		return
	}

	if err := h.orgService.RemoveMember(c.Request.Context(), memberID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"removed": true})
}

// UpdateMemberRole updates a member's role.
func (h *OrganizationHandler) UpdateMemberRole(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	orgID, err := strconv.Atoi(c.Param("org_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid organization id"})
		return
	}

	memberID, err := strconv.Atoi(c.Param("member_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid member id"})
		return
	}

	// Check if user is owner (only owners can change roles)
	isOwner, err := h.orgService.IsOwner(c.Request.Context(), orgID, user.ID)
	if err != nil || !isOwner {
		c.JSON(http.StatusForbidden, gin.H{"error": "only owner can change roles"})
		return
	}

	var input services.UpdateMemberRoleInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	member, err := h.orgService.UpdateMemberRole(c.Request.Context(), memberID, input.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, member)
}

// ListInvitations lists all invitations for an organization.
func (h *OrganizationHandler) ListInvitations(c *gin.Context) {
	orgID, err := strconv.Atoi(c.Param("org_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid organization id"})
		return
	}

	invitations, err := h.orgService.GetInvitations(c.Request.Context(), orgID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"invitations": invitations})
}

// CreateInvitation creates a new invitation.
func (h *OrganizationHandler) CreateInvitation(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	orgID, err := strconv.Atoi(c.Param("org_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid organization id"})
		return
	}

	// Check if user is admin
	isAdmin, err := h.orgService.IsAdmin(c.Request.Context(), orgID, user.ID)
	if err != nil || !isAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "permission denied"})
		return
	}

	var input services.CreateInvitationInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	invitation, err := h.orgService.CreateInvitation(c.Request.Context(), orgID, user.ID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, invitation)
}

// AcceptInvitation accepts an invitation.
func (h *OrganizationHandler) AcceptInvitation(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	var input services.AcceptInvitationInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	org, err := h.orgService.AcceptInvitation(c.Request.Context(), user.ID, input.Token)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"organization": org})
}

// RevokeInvitation revokes an invitation.
func (h *OrganizationHandler) RevokeInvitation(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	orgID, err := strconv.Atoi(c.Param("org_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid organization id"})
		return
	}

	invID, err := strconv.Atoi(c.Param("inv_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid invitation id"})
		return
	}

	// Check if user is admin
	isAdmin, err := h.orgService.IsAdmin(c.Request.Context(), orgID, user.ID)
	if err != nil || !isAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "permission denied"})
		return
	}

	if err := h.orgService.RevokeInvitation(c.Request.Context(), invID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"revoked": true})
}
