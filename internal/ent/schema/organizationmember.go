package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// OrganizationMember holds the schema definition for the OrganizationMember entity.
type OrganizationMember struct {
	ent.Schema
}

// OrgRole represents organization member roles.
type OrgRole string

const (
	OrgRoleOwner  OrgRole = "OWNER"
	OrgRoleAdmin  OrgRole = "ADMIN"
	OrgRoleMember OrgRole = "MEMBER"
)

// Values returns all possible OrgRole values.
func (OrgRole) Values() []string {
	return []string{
		string(OrgRoleOwner),
		string(OrgRoleAdmin),
		string(OrgRoleMember),
	}
}

// Fields of the OrganizationMember.
func (OrganizationMember) Fields() []ent.Field {
	return []ent.Field{
		field.Enum("role").
			Values("OWNER", "ADMIN", "MEMBER").
			Default("MEMBER"),
		field.Time("joined_at").
			Default(time.Now),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now),
	}
}

// Edges of the OrganizationMember.
func (OrganizationMember) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("organization", Organization.Type).
			Ref("members").
			Unique().
			Required(),
		edge.From("user", User.Type).
			Ref("organization_memberships").
			Unique().
			Required(),
	}
}

// Indexes of the OrganizationMember.
func (OrganizationMember) Indexes() []ent.Index {
	return []ent.Index{
		index.Edges("organization", "user").
			Unique(),
	}
}
