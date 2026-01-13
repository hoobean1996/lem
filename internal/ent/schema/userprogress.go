package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// UserProgress holds the schema definition for the UserProgress entity.
type UserProgress struct {
	ent.Schema
}

// Fields of the UserProgress.
func (UserProgress) Fields() []ent.Field {
	return []ent.Field{
		field.String("adventure_slug").
			NotEmpty(),
		field.String("level_slug").
			NotEmpty(),
		field.Int("stars").
			Default(0).
			Min(0).
			Max(3),
		field.Bool("completed").
			Default(false),
		field.Int("attempts").
			Default(0),
		field.Text("best_code").
			Optional(),
		field.Time("first_completed_at").
			Optional().
			Nillable(),
		field.Time("last_attempt_at").
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

// Edges of the UserProgress.
func (UserProgress) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("app", App.Type).
			Ref("user_progress").
			Unique().
			Required(),
		edge.From("user", User.Type).
			Ref("user_progress").
			Unique().
			Required(),
	}
}

// Indexes of the UserProgress.
func (UserProgress) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("adventure_slug", "level_slug").
			Edges("app", "user").
			Unique(),
		index.Fields("adventure_slug").
			Edges("user"),
	}
}
