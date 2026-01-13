package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// ShenbiSettings holds the schema definition for the ShenbiSettings entity.
type ShenbiSettings struct {
	ent.Schema
}

// Fields of the ShenbiSettings.
func (ShenbiSettings) Fields() []ent.Field {
	return []ent.Field{
		field.Bool("sound_enabled").
			Default(true),
		field.String("preferred_theme").
			Default("light"),
		field.JSON("tour_completed", map[string]bool{}).
			Optional(),
		field.Time("created_at").
			Default(time.Now).
			Immutable(),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now),
	}
}

// Edges of the ShenbiSettings.
func (ShenbiSettings) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("app", App.Type).
			Ref("shenbi_settings").
			Unique().
			Required(),
		edge.From("user", User.Type).
			Ref("shenbi_settings").
			Unique().
			Required(),
	}
}

// Indexes of the ShenbiSettings.
func (ShenbiSettings) Indexes() []ent.Index {
	return []ent.Index{
		index.Edges("app", "user").
			Unique(),
	}
}
