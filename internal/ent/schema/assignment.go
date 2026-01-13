package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// Assignment holds the schema definition for the Assignment entity.
type Assignment struct {
	ent.Schema
}

// AssignmentStatus represents assignment status.
type AssignmentStatus string

const (
	AssignmentStatusDraft     AssignmentStatus = "DRAFT"
	AssignmentStatusPublished AssignmentStatus = "PUBLISHED"
	AssignmentStatusClosed    AssignmentStatus = "CLOSED"
)

// Fields of the Assignment.
func (Assignment) Fields() []ent.Field {
	return []ent.Field{
		field.String("title").
			NotEmpty(),
		field.Text("description").
			Optional(),
		field.JSON("level_ids", []string{}).
			Optional(),
		field.Int("max_points").
			Default(100),
		field.Time("due_date").
			Optional().
			Nillable(),
		field.Enum("status").
			Values("DRAFT", "PUBLISHED", "CLOSED").
			Default("DRAFT"),
		field.Time("created_at").
			Default(time.Now).
			Immutable(),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now),
	}
}

// Edges of the Assignment.
func (Assignment) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("classroom", Classroom.Type).
			Ref("assignments").
			Unique().
			Required(),
		edge.To("submissions", AssignmentSubmission.Type),
	}
}

// Indexes of the Assignment.
func (Assignment) Indexes() []ent.Index {
	return []ent.Index{
		index.Edges("classroom"),
		index.Fields("status"),
	}
}
