package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// BattleSession holds the schema definition for the BattleSession entity.
type BattleSession struct {
	ent.Schema
}

// BattleSessionStatus represents battle session status.
type BattleSessionStatus string

const (
	BattleSessionStatusActive  BattleSessionStatus = "ACTIVE"
	BattleSessionStatusEnded   BattleSessionStatus = "ENDED"
	BattleSessionStatusExpired BattleSessionStatus = "EXPIRED"
)

// Fields of the BattleSession.
func (BattleSession) Fields() []ent.Field {
	return []ent.Field{
		field.String("room_code").
			NotEmpty(),
		field.Bool("is_host").
			Default(false),
		field.String("player_name").
			Optional(),
		field.Enum("status").
			Values("ACTIVE", "ENDED", "EXPIRED").
			Default("ACTIVE"),
		field.Time("expires_at").
			Default(func() time.Time {
				return time.Now().Add(time.Hour)
			}),
		field.Time("created_at").
			Default(time.Now).
			Immutable(),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now),
	}
}

// Edges of the BattleSession.
func (BattleSession) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("app", App.Type).
			Ref("battle_sessions").
			Unique().
			Required(),
		edge.From("user", User.Type).
			Ref("battle_sessions").
			Unique().
			Required(),
	}
}

// Indexes of the BattleSession.
func (BattleSession) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("room_code"),
		index.Fields("status"),
	}
}
