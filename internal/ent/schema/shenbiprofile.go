package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// ShenbiProfile holds the schema definition for the ShenbiProfile entity.
type ShenbiProfile struct {
	ent.Schema
}

// ShenbiRole represents user roles in Shenbi.
type ShenbiRole string

const (
	ShenbiRoleStudent ShenbiRole = "STUDENT"
	ShenbiRoleTeacher ShenbiRole = "TEACHER"
	ShenbiRoleAdmin   ShenbiRole = "ADMIN"
)

// Fields of the ShenbiProfile.
func (ShenbiProfile) Fields() []ent.Field {
	return []ent.Field{
		field.Enum("role").
			Values("STUDENT", "TEACHER", "ADMIN").
			Default("STUDENT"),
		field.String("display_name").
			Optional(),
		field.String("avatar_url").
			Optional(),
		field.Int("grade").
			Optional().
			Nillable(),
		field.Int("age").
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

// Edges of the ShenbiProfile.
func (ShenbiProfile) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("app", App.Type).
			Ref("shenbi_profiles").
			Unique().
			Required(),
		edge.From("user", User.Type).
			Ref("shenbi_profile").
			Unique().
			Required(),
	}
}

// Indexes of the ShenbiProfile.
func (ShenbiProfile) Indexes() []ent.Index {
	return []ent.Index{
		index.Edges("app", "user").
			Unique(),
	}
}
