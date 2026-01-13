package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// Achievement holds the schema definition for the Achievement entity.
type Achievement struct {
	ent.Schema
}

// Fields of the Achievement.
func (Achievement) Fields() []ent.Field {
	return []ent.Field{
		field.String("achievement_id").
			NotEmpty(),
		field.Time("earned_at").
			Default(time.Now),
	}
}

// Edges of the Achievement.
func (Achievement) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("app", App.Type).
			Ref("achievements").
			Unique().
			Required(),
		edge.From("user", User.Type).
			Ref("achievements").
			Unique().
			Required(),
	}
}

// Indexes of the Achievement.
func (Achievement) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("achievement_id").
			Edges("app", "user").
			Unique(),
	}
}
