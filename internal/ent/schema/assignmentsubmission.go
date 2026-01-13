package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// AssignmentSubmission holds the schema definition for the AssignmentSubmission entity.
type AssignmentSubmission struct {
	ent.Schema
}

// Fields of the AssignmentSubmission.
func (AssignmentSubmission) Fields() []ent.Field {
	return []ent.Field{
		field.Int("levels_completed").
			Default(0),
		field.Int("total_levels").
			Default(0),
		field.Int("total_stars").
			Default(0),
		field.Float("grade_percentage").
			Optional().
			Nillable(),
		field.Float("manual_grade").
			Optional().
			Nillable(),
		field.Text("teacher_notes").
			Optional(),
		field.Time("submitted_at").
			Optional().
			Nillable(),
		field.Time("graded_at").
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

// Edges of the AssignmentSubmission.
func (AssignmentSubmission) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("assignment", Assignment.Type).
			Ref("submissions").
			Unique().
			Required(),
		edge.From("student", User.Type).
			Ref("assignment_submissions").
			Unique().
			Required(),
	}
}

// Indexes of the AssignmentSubmission.
func (AssignmentSubmission) Indexes() []ent.Index {
	return []ent.Index{
		index.Edges("assignment", "student").
			Unique(),
	}
}
