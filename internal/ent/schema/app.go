package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// App holds the schema definition for the App entity (multi-tenant).
type App struct {
	ent.Schema
}

// Fields of the App.
func (App) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").
			NotEmpty(),
		field.String("slug").
			Unique().
			NotEmpty(),
		field.String("api_key").
			Unique().
			NotEmpty().
			Sensitive(),
		field.String("api_secret").
			Optional().
			Sensitive(),
		field.JSON("allowed_origins", []string{}).
			Optional(),
		field.String("webhook_url").
			Optional(),
		field.String("stripe_product_id").
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

// Edges of the App.
func (App) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("user_apps", UserApp.Type),
		edge.To("organizations", Organization.Type),
		edge.To("plans", Plan.Type),
		edge.To("subscriptions", Subscription.Type),
		edge.To("email_templates", EmailTemplate.Type),
		edge.To("shenbi_profiles", ShenbiProfile.Type),
		edge.To("classrooms", Classroom.Type),
		edge.To("user_progress", UserProgress.Type),
		edge.To("achievements", Achievement.Type),
		edge.To("battle_rooms", BattleRoom.Type),
		edge.To("battle_sessions", BattleSession.Type),
		edge.To("live_sessions", LiveSession.Type),
		edge.To("classroom_sessions", ClassroomSession.Type),
		edge.To("shenbi_settings", ShenbiSettings.Type),
	}
}

// Indexes of the App.
func (App) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("slug"),
		index.Fields("api_key"),
	}
}
