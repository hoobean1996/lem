package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// LiveSessionStudent holds the schema definition for the LiveSessionStudent entity.
type LiveSessionStudent struct {
	ent.Schema
}

// Fields of the LiveSessionStudent.
func (LiveSessionStudent) Fields() []ent.Field {
	return []ent.Field{
		field.String("student_name").
			Optional(),
		field.Int("stars_collected").
			Default(0),
		field.Bool("completed").
			Default(false),
		field.Time("completed_at").
			Optional().
			Nillable(),
		field.Text("code").
			Optional(),
		field.Time("joined_at").
			Default(time.Now),
		field.Time("left_at").
			Optional().
			Nillable(),
		field.Time("last_updated_at").
			Default(time.Now).
			UpdateDefault(time.Now),
	}
}

// Edges of the LiveSessionStudent.
func (LiveSessionStudent) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("session", LiveSession.Type).
			Ref("students").
			Unique().
			Required(),
		edge.From("student", User.Type).
			Ref("live_session_participations").
			Unique().
			Required(),
	}
}

// Indexes of the LiveSessionStudent.
func (LiveSessionStudent) Indexes() []ent.Index {
	return []ent.Index{
		index.Edges("session", "student").
			Unique(),
	}
}
