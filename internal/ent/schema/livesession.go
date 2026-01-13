package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// LiveSession holds the schema definition for the LiveSession entity.
type LiveSession struct {
	ent.Schema
}

// LiveSessionStatus represents live session status.
type LiveSessionStatus string

const (
	LiveSessionStatusWaiting LiveSessionStatus = "WAITING"
	LiveSessionStatusReady   LiveSessionStatus = "READY"
	LiveSessionStatusPlaying LiveSessionStatus = "PLAYING"
	LiveSessionStatusEnded   LiveSessionStatus = "ENDED"
)

// Fields of the LiveSession.
func (LiveSession) Fields() []ent.Field {
	return []ent.Field{
		field.String("room_code").
			Unique().
			NotEmpty(),
		field.Enum("status").
			Values("WAITING", "READY", "PLAYING", "ENDED").
			Default("WAITING"),
		field.JSON("level", map[string]interface{}{}).
			Optional(),
		field.Time("started_at").
			Optional().
			Nillable(),
		field.Time("ended_at").
			Optional().
			Nillable(),
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

// Edges of the LiveSession.
func (LiveSession) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("app", App.Type).
			Ref("live_sessions").
			Unique().
			Required(),
		edge.From("classroom", Classroom.Type).
			Ref("live_sessions").
			Unique().
			Required(),
		edge.From("teacher", User.Type).
			Ref("live_sessions_teaching").
			Unique().
			Required(),
		edge.To("students", LiveSessionStudent.Type),
	}
}

// Indexes of the LiveSession.
func (LiveSession) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("room_code"),
		index.Fields("status"),
	}
}
