package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// Plan holds the schema definition for the Plan entity.
type Plan struct {
	ent.Schema
}

// BillingInterval represents billing interval options.
type BillingInterval string

const (
	BillingIntervalMonthly  BillingInterval = "MONTHLY"
	BillingIntervalYearly   BillingInterval = "YEARLY"
	BillingIntervalLifetime BillingInterval = "LIFETIME"
)

// Fields of the Plan.
func (Plan) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").
			NotEmpty(),
		field.String("slug").
			NotEmpty(),
		field.String("description").
			Optional(),
		field.Int("price_cents").
			Default(0),
		field.String("currency").
			Default("USD"),
		field.Enum("billing_interval").
			Values("MONTHLY", "YEARLY", "LIFETIME").
			Default("MONTHLY"),
		field.String("stripe_price_id").
			Optional(),
		field.JSON("features", map[string]interface{}{}).
			Optional(),
		field.Bool("is_active").
			Default(true),
		field.Bool("is_default").
			Default(false),
		field.Time("created_at").
			Default(time.Now).
			Immutable(),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now),
	}
}

// Edges of the Plan.
func (Plan) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("app", App.Type).
			Ref("plans").
			Unique().
			Required(),
		edge.To("subscriptions", Subscription.Type),
	}
}

// Indexes of the Plan.
func (Plan) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("slug").
			Edges("app").
			Unique(),
		index.Fields("stripe_price_id"),
	}
}
