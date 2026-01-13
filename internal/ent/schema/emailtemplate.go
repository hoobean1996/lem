package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// EmailTemplate holds the schema definition for the EmailTemplate entity.
type EmailTemplate struct {
	ent.Schema
}

// Fields of the EmailTemplate.
func (EmailTemplate) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").
			NotEmpty(),
		field.String("description").
			Optional(),
		field.String("subject").
			NotEmpty(),
		field.Text("body_html").
			Optional(),
		field.Text("body_text").
			Optional(),
		field.JSON("variables", []string{}).
			Optional(),
		field.Time("created_at").
			Default(time.Now).
			Immutable(),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now),
	}
}

// Edges of the EmailTemplate.
func (EmailTemplate) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("app", App.Type).
			Ref("email_templates").
			Unique().
			Required(),
	}
}

// Indexes of the EmailTemplate.
func (EmailTemplate) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("name").
			Edges("app").
			Unique(),
	}
}
