package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// Subscription holds the schema definition for the Subscription entity.
type Subscription struct {
	ent.Schema
}

// SubscriptionStatus represents subscription status.
type SubscriptionStatus string

const (
	SubscriptionStatusActive     SubscriptionStatus = "ACTIVE"
	SubscriptionStatusCanceled   SubscriptionStatus = "CANCELED"
	SubscriptionStatusPastDue    SubscriptionStatus = "PAST_DUE"
	SubscriptionStatusTrialing   SubscriptionStatus = "TRIALING"
	SubscriptionStatusIncomplete SubscriptionStatus = "INCOMPLETE"
	SubscriptionStatusExpired    SubscriptionStatus = "EXPIRED"
)

// Fields of the Subscription.
func (Subscription) Fields() []ent.Field {
	return []ent.Field{
		field.Enum("status").
			Values("ACTIVE", "CANCELED", "PAST_DUE", "TRIALING", "INCOMPLETE", "EXPIRED").
			Default("ACTIVE"),
		field.String("stripe_subscription_id").
			Optional(),
		field.Time("current_period_start").
			Optional().
			Nillable(),
		field.Time("current_period_end").
			Optional().
			Nillable(),
		field.Time("canceled_at").
			Optional().
			Nillable(),
		field.Time("trial_end").
			Optional().
			Nillable(),
		field.Time("created_at").
			Default(time.Now).
			Immutable(),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now),
	}
}

// Edges of the Subscription.
func (Subscription) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).
			Ref("subscriptions").
			Unique(),
		edge.From("organization", Organization.Type).
			Ref("subscriptions").
			Unique(),
		edge.From("app", App.Type).
			Ref("subscriptions").
			Unique().
			Required(),
		edge.From("plan", Plan.Type).
			Ref("subscriptions").
			Unique().
			Required(),
	}
}

// Indexes of the Subscription.
func (Subscription) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("stripe_subscription_id"),
		index.Edges("user", "app"),
		index.Edges("organization", "app"),
	}
}
