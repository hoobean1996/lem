package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// Organization holds the schema definition for the Organization entity.
type Organization struct {
	ent.Schema
}

// Fields of the Organization.
func (Organization) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").
			NotEmpty(),
		field.String("slug").
			NotEmpty(),
		field.String("description").
			Optional(),
		field.String("logo_url").
			Optional(),
		field.String("stripe_customer_id").
			Optional(),
		field.JSON("settings", map[string]interface{}{}).
			Optional(),
		field.Bool("is_active").
			Default(true),
		field.Time("created_at").
			Default(time.Now).
			Immutable(),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now),
	}
}

// Edges of the Organization.
func (Organization) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("app", App.Type).
			Ref("organizations").
			Unique().
			Required(),
		edge.To("members", OrganizationMember.Type),
		edge.To("invitations", OrganizationInvitation.Type),
		edge.To("subscriptions", Subscription.Type),
	}
}

// Indexes of the Organization.
func (Organization) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("slug").
			Edges("app").
			Unique(),
	}
}
