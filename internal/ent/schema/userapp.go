package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// UserApp holds the schema definition for the UserApp entity.
// Links users to apps with app-specific data like Stripe customer ID.
type UserApp struct {
	ent.Schema
}

// Fields of the UserApp.
func (UserApp) Fields() []ent.Field {
	return []ent.Field{
		field.String("stripe_customer_id").
			Optional(),
		field.Time("enabled_at").
			Default(time.Now),
	}
}

// Edges of the UserApp.
func (UserApp) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).
			Ref("user_apps").
			Unique().
			Required(),
		edge.From("app", App.Type).
			Ref("user_apps").
			Unique().
			Required(),
	}
}

// Indexes of the UserApp.
func (UserApp) Indexes() []ent.Index {
	return []ent.Index{
		index.Edges("user", "app").
			Unique(),
	}
}
