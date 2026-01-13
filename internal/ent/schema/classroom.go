package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// Classroom holds the schema definition for the Classroom entity.
type Classroom struct {
	ent.Schema
}

// Fields of the Classroom.
func (Classroom) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").
			NotEmpty(),
		field.String("description").
			Optional(),
		field.String("join_code").
			Unique().
			NotEmpty(),
		field.Bool("is_active").
			Default(true),
		field.Bool("allow_join").
			Default(true),
		field.String("active_room_code").
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

// Edges of the Classroom.
func (Classroom) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("app", App.Type).
			Ref("classrooms").
			Unique().
			Required(),
		edge.From("teacher", User.Type).
			Ref("classrooms_teaching").
			Unique().
			Required(),
		edge.To("memberships", ClassroomMembership.Type),
		edge.To("assignments", Assignment.Type),
		edge.To("live_sessions", LiveSession.Type),
		edge.To("classroom_sessions", ClassroomSession.Type),
	}
}

// Indexes of the Classroom.
func (Classroom) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("join_code"),
	}
}
