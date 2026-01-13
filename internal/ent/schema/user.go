package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// User holds the schema definition for the User entity.
type User struct {
	ent.Schema
}

// Fields of the User.
func (User) Fields() []ent.Field {
	return []ent.Field{
		field.String("email").
			Unique(),
		field.String("password_hash").
			Optional(),
		field.String("name").
			Optional(),
		field.String("avatar_url").
			Optional(),
		field.String("device_id").
			Optional().
			Unique().
			Nillable(),
		field.String("google_id").
			Optional().
			Unique().
			Nillable(),
		field.String("apple_id").
			Optional().
			Unique().
			Nillable(),
		field.String("google_access_token").
			Optional().
			Sensitive(),
		field.String("google_refresh_token").
			Optional().
			Sensitive(),
		field.Time("google_token_expires_at").
			Optional().
			Nillable(),
		field.Bool("is_active").
			Default(true),
		field.Bool("is_verified").
			Default(false),
		field.JSON("extra_data", map[string]interface{}{}).
			Optional(),
		field.Time("created_at").
			Default(time.Now).
			Immutable(),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now),
		field.Time("last_login_at").
			Optional().
			Nillable(),
	}
}

// Edges of the User.
func (User) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("user_apps", UserApp.Type),
		edge.To("organization_memberships", OrganizationMember.Type),
		edge.To("subscriptions", Subscription.Type),
		edge.To("shenbi_profile", ShenbiProfile.Type).
			Unique(),
		edge.To("classrooms_teaching", Classroom.Type),
		edge.To("classroom_memberships", ClassroomMembership.Type),
		edge.To("assignment_submissions", AssignmentSubmission.Type),
		edge.To("user_progress", UserProgress.Type),
		edge.To("achievements", Achievement.Type),
		edge.To("battle_rooms_hosted", BattleRoom.Type).
			Annotations(),
		edge.To("battle_sessions", BattleSession.Type),
		edge.To("live_sessions_teaching", LiveSession.Type),
		edge.To("live_session_participations", LiveSessionStudent.Type),
		edge.To("classroom_sessions", ClassroomSession.Type),
		edge.To("shenbi_settings", ShenbiSettings.Type).
			Unique(),
		edge.To("sent_invitations", OrganizationInvitation.Type),
	}
}

// Indexes of the User.
func (User) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("email"),
		index.Fields("device_id"),
		index.Fields("google_id"),
	}
}
