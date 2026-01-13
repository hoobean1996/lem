package services

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"gigaboo.io/lem/internal/config"
	"gigaboo.io/lem/internal/ent"
	"gigaboo.io/lem/internal/ent/organization"
	"gigaboo.io/lem/internal/ent/organizationinvitation"
	"gigaboo.io/lem/internal/ent/organizationmember"
	"gigaboo.io/lem/internal/ent/user"
)

// OrganizationService handles organization operations.
type OrganizationService struct {
	cfg    *config.Config
	client *ent.Client
}

// NewOrganizationService creates a new organization service.
func NewOrganizationService(cfg *config.Config, client *ent.Client) *OrganizationService {
	return &OrganizationService{
		cfg:    cfg,
		client: client,
	}
}

// CreateOrganizationInput represents create organization request.
type CreateOrganizationInput struct {
	Name        string `json:"name" binding:"required"`
	Slug        string `json:"slug" binding:"required"`
	Description string `json:"description"`
	LogoURL     string `json:"logo_url"`
}

// UpdateOrganizationInput represents update organization request.
type UpdateOrganizationInput struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
	LogoURL     *string `json:"logo_url"`
}

// CreateInvitationInput represents invitation creation request.
type CreateInvitationInput struct {
	Email string `json:"email" binding:"required,email"`
	Role  string `json:"role" binding:"required,oneof=OWNER ADMIN MEMBER"`
}

// AcceptInvitationInput represents accept invitation request.
type AcceptInvitationInput struct {
	Token string `json:"token" binding:"required"`
}

// UpdateMemberRoleInput represents member role update request.
type UpdateMemberRoleInput struct {
	Role string `json:"role" binding:"required,oneof=OWNER ADMIN MEMBER"`
}

// ListByUser returns all organizations for a user.
func (s *OrganizationService) ListByUser(ctx context.Context, userID, appID int) ([]*ent.Organization, error) {
	members, err := s.client.OrganizationMember.Query().
		Where(organizationmember.HasUserWith(user.ID(userID))).
		WithOrganization().
		All(ctx)
	if err != nil {
		return nil, err
	}

	orgs := make([]*ent.Organization, 0, len(members))
	for _, m := range members {
		if m.Edges.Organization != nil {
			orgs = append(orgs, m.Edges.Organization)
		}
	}
	return orgs, nil
}

// GetByID returns an organization by ID.
func (s *OrganizationService) GetByID(ctx context.Context, orgID int) (*ent.Organization, error) {
	return s.client.Organization.Get(ctx, orgID)
}

// Create creates a new organization.
func (s *OrganizationService) Create(ctx context.Context, appID, userID int, input CreateOrganizationInput) (*ent.Organization, error) {
	// Start a transaction
	tx, err := s.client.Tx(ctx)
	if err != nil {
		return nil, err
	}

	// Create organization
	org, err := tx.Organization.Create().
		SetAppID(appID).
		SetName(input.Name).
		SetSlug(input.Slug).
		SetDescription(input.Description).
		SetLogoURL(input.LogoURL).
		Save(ctx)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	// Add creator as owner
	_, err = tx.OrganizationMember.Create().
		SetOrganizationID(org.ID).
		SetUserID(userID).
		SetRole(organizationmember.RoleOWNER).
		Save(ctx)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return org, nil
}

// Update updates an organization.
func (s *OrganizationService) Update(ctx context.Context, orgID int, input UpdateOrganizationInput) (*ent.Organization, error) {
	update := s.client.Organization.UpdateOneID(orgID)

	if input.Name != nil {
		update.SetName(*input.Name)
	}
	if input.Description != nil {
		update.SetDescription(*input.Description)
	}
	if input.LogoURL != nil {
		update.SetLogoURL(*input.LogoURL)
	}

	return update.Save(ctx)
}

// Delete deletes an organization.
func (s *OrganizationService) Delete(ctx context.Context, orgID int) error {
	return s.client.Organization.DeleteOneID(orgID).Exec(ctx)
}

// GetMembers returns all members of an organization.
func (s *OrganizationService) GetMembers(ctx context.Context, orgID int) ([]*ent.OrganizationMember, error) {
	return s.client.OrganizationMember.Query().
		Where(organizationmember.HasOrganizationWith(organization.ID(orgID))).
		WithUser().
		All(ctx)
}

// GetMember returns a specific member.
func (s *OrganizationService) GetMember(ctx context.Context, orgID, userID int) (*ent.OrganizationMember, error) {
	return s.client.OrganizationMember.Query().
		Where(
			organizationmember.HasOrganizationWith(organization.ID(orgID)),
			organizationmember.HasUserWith(user.ID(userID)),
		).
		First(ctx)
}

// RemoveMember removes a member from organization.
func (s *OrganizationService) RemoveMember(ctx context.Context, memberID int) error {
	return s.client.OrganizationMember.DeleteOneID(memberID).Exec(ctx)
}

// UpdateMemberRole updates a member's role.
func (s *OrganizationService) UpdateMemberRole(ctx context.Context, memberID int, role string) (*ent.OrganizationMember, error) {
	return s.client.OrganizationMember.UpdateOneID(memberID).
		SetRole(organizationmember.Role(role)).
		Save(ctx)
}

// GetInvitations returns all invitations for an organization.
func (s *OrganizationService) GetInvitations(ctx context.Context, orgID int) ([]*ent.OrganizationInvitation, error) {
	return s.client.OrganizationInvitation.Query().
		Where(organizationinvitation.HasOrganizationWith(organization.ID(orgID))).
		WithInvitedBy().
		All(ctx)
}

// CreateInvitation creates a new invitation.
func (s *OrganizationService) CreateInvitation(ctx context.Context, orgID, inviterID int, input CreateInvitationInput) (*ent.OrganizationInvitation, error) {
	// Generate token
	token, err := generateInviteToken(32)
	if err != nil {
		return nil, err
	}

	return s.client.OrganizationInvitation.Create().
		SetOrganizationID(orgID).
		SetInvitedByID(inviterID).
		SetEmail(input.Email).
		SetRole(organizationinvitation.Role(input.Role)).
		SetToken(token).
		SetStatus(organizationinvitation.StatusPENDING).
		SetExpiresAt(time.Now().Add(7 * 24 * time.Hour)).
		Save(ctx)
}

// AcceptInvitation accepts an invitation.
func (s *OrganizationService) AcceptInvitation(ctx context.Context, userID int, token string) (*ent.Organization, error) {
	// Find invitation
	inv, err := s.client.OrganizationInvitation.Query().
		Where(
			organizationinvitation.Token(token),
			organizationinvitation.StatusEQ(organizationinvitation.StatusPENDING),
		).
		WithOrganization().
		First(ctx)
	if err != nil {
		return nil, errors.New("invalid or expired invitation")
	}

	// Check expiration
	if !inv.ExpiresAt.IsZero() && time.Now().After(inv.ExpiresAt) {
		s.client.OrganizationInvitation.UpdateOne(inv).
			SetStatus(organizationinvitation.StatusEXPIRED).
			Save(ctx)
		return nil, errors.New("invitation has expired")
	}

	// Start transaction
	tx, err := s.client.Tx(ctx)
	if err != nil {
		return nil, err
	}

	// Add user as member
	_, err = tx.OrganizationMember.Create().
		SetOrganizationID(inv.Edges.Organization.ID).
		SetUserID(userID).
		SetRole(organizationmember.Role(string(inv.Role))).
		Save(ctx)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	// Update invitation status
	now := time.Now()
	_, err = tx.OrganizationInvitation.UpdateOne(inv).
		SetStatus(organizationinvitation.StatusACCEPTED).
		SetAcceptedAt(now).
		Save(ctx)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return inv.Edges.Organization, nil
}

// RevokeInvitation revokes an invitation.
func (s *OrganizationService) RevokeInvitation(ctx context.Context, invitationID int) error {
	_, err := s.client.OrganizationInvitation.UpdateOneID(invitationID).
		SetStatus(organizationinvitation.StatusREVOKED).
		Save(ctx)
	return err
}

// IsOwner checks if user is owner of organization.
func (s *OrganizationService) IsOwner(ctx context.Context, orgID, userID int) (bool, error) {
	member, err := s.GetMember(ctx, orgID, userID)
	if err != nil {
		return false, err
	}
	return member.Role == organizationmember.RoleOWNER, nil
}

// IsAdmin checks if user is admin or owner of organization.
func (s *OrganizationService) IsAdmin(ctx context.Context, orgID, userID int) (bool, error) {
	member, err := s.GetMember(ctx, orgID, userID)
	if err != nil {
		return false, err
	}
	return member.Role == organizationmember.RoleOWNER || member.Role == organizationmember.RoleADMIN, nil
}

func generateInviteToken(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
