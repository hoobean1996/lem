package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// ClassroomMembership holds the schema definition for the ClassroomMembership entity.
type ClassroomMembership struct {
	ent.Schema
}

// MembershipStatus represents classroom membership status.
type MembershipStatus string

const (
	MembershipStatusActive  MembershipStatus = "ACTIVE"
	MembershipStatusRemoved MembershipStatus = "REMOVED"
	MembershipStatusLeft    MembershipStatus = "LEFT"
)

// Fields of the ClassroomMembership.
func (ClassroomMembership) Fields() []ent.Field {
	return []ent.Field{
		field.Enum("status").
			Values("ACTIVE", "REMOVED", "LEFT").
			Default("ACTIVE"),
		field.Time("joined_at").
			Default(time.Now),
		field.Time("left_at").
			Optional().
			Nillable(),
	}
}

// Edges of the ClassroomMembership.
func (ClassroomMembership) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("classroom", Classroom.Type).
			Ref("memberships").
			Unique().
			Required(),
		edge.From("student", User.Type).
			Ref("classroom_memberships").
			Unique().
			Required(),
	}
}

// Indexes of the ClassroomMembership.
func (ClassroomMembership) Indexes() []ent.Index {
	return []ent.Index{
		index.Edges("classroom", "student").
			Unique(),
	}
}
