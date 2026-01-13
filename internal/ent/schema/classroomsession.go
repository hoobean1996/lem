package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// ClassroomSession holds the schema definition for the ClassroomSession entity.
type ClassroomSession struct {
	ent.Schema
}

// ClassroomSessionStatus represents classroom session status.
type ClassroomSessionStatus string

const (
	ClassroomSessionStatusActive  ClassroomSessionStatus = "ACTIVE"
	ClassroomSessionStatusEnded   ClassroomSessionStatus = "ENDED"
	ClassroomSessionStatusExpired ClassroomSessionStatus = "EXPIRED"
)

// Fields of the ClassroomSession.
func (ClassroomSession) Fields() []ent.Field {
	return []ent.Field{
		field.String("room_code").
			NotEmpty(),
		field.Enum("role").
			Values("teacher", "student").
			Default("student"),
		field.Enum("status").
			Values("ACTIVE", "ENDED", "EXPIRED").
			Default("ACTIVE"),
		field.Time("expires_at").
			Default(func() time.Time {
				return time.Now().Add(2 * time.Hour)
			}),
		field.Time("created_at").
			Default(time.Now).
			Immutable(),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now),
	}
}

// Edges of the ClassroomSession.
func (ClassroomSession) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("app", App.Type).
			Ref("classroom_sessions").
			Unique().
			Required(),
		edge.From("user", User.Type).
			Ref("classroom_sessions").
			Unique().
			Required(),
		edge.From("classroom", Classroom.Type).
			Ref("classroom_sessions").
			Unique().
			Required(),
	}
}

// Indexes of the ClassroomSession.
func (ClassroomSession) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("room_code"),
		index.Fields("status"),
	}
}
