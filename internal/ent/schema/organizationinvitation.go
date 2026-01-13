package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// OrganizationInvitation holds the schema definition for the OrganizationInvitation entity.
type OrganizationInvitation struct {
	ent.Schema
}

// InvitationStatus represents invitation status.
type InvitationStatus string

const (
	InvitationStatusPending  InvitationStatus = "PENDING"
	InvitationStatusAccepted InvitationStatus = "ACCEPTED"
	InvitationStatusExpired  InvitationStatus = "EXPIRED"
	InvitationStatusRevoked  InvitationStatus = "REVOKED"
)

// Fields of the OrganizationInvitation.
func (OrganizationInvitation) Fields() []ent.Field {
	return []ent.Field{
		field.String("email").
			NotEmpty(),
		field.Enum("role").
			Values("OWNER", "ADMIN", "MEMBER").
			Default("MEMBER"),
		field.String("token").
			Unique().
			NotEmpty(),
		field.Enum("status").
			Values("PENDING", "ACCEPTED", "EXPIRED", "REVOKED").
			Default("PENDING"),
		field.Time("created_at").
			Default(time.Now).
			Immutable(),
		field.Time("expires_at").
			Optional(),
		field.Time("accepted_at").
			Optional().
			Nillable(),
	}
}

// Edges of the OrganizationInvitation.
func (OrganizationInvitation) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("organization", Organization.Type).
			Ref("invitations").
			Unique().
			Required(),
		edge.From("invited_by", User.Type).
			Ref("sent_invitations").
			Unique().
			Required(),
	}
}

// Indexes of the OrganizationInvitation.
func (OrganizationInvitation) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("token"),
		index.Fields("email"),
	}
}
