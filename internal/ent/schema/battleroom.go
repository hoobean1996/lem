package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// BattleRoom holds the schema definition for the BattleRoom entity.
type BattleRoom struct {
	ent.Schema
}

// BattleRoomStatus represents battle room status.
type BattleRoomStatus string

const (
	BattleRoomStatusWaiting  BattleRoomStatus = "WAITING"
	BattleRoomStatusReady    BattleRoomStatus = "READY"
	BattleRoomStatusPlaying  BattleRoomStatus = "PLAYING"
	BattleRoomStatusFinished BattleRoomStatus = "FINISHED"
	BattleRoomStatusExpired  BattleRoomStatus = "EXPIRED"
)

// Fields of the BattleRoom.
func (BattleRoom) Fields() []ent.Field {
	return []ent.Field{
		field.String("room_code").
			Unique().
			NotEmpty(),
		field.String("host_name").
			Optional(),
		field.Int("guest_id").
			Optional().
			Nillable(),
		field.String("guest_name").
			Optional(),
		field.Enum("status").
			Values("WAITING", "READY", "PLAYING", "FINISHED", "EXPIRED").
			Default("WAITING"),
		field.JSON("level", map[string]interface{}{}).
			Optional(),
		field.Bool("host_completed").
			Default(false),
		field.Time("host_completed_at").
			Optional().
			Nillable(),
		field.Text("host_code").
			Optional(),
		field.Bool("guest_completed").
			Default(false),
		field.Time("guest_completed_at").
			Optional().
			Nillable(),
		field.Text("guest_code").
			Optional(),
		field.Int("winner_id").
			Optional().
			Nillable(),
		field.Time("started_at").
			Optional().
			Nillable(),
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

// Edges of the BattleRoom.
func (BattleRoom) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("app", App.Type).
			Ref("battle_rooms").
			Unique().
			Required(),
		edge.From("host", User.Type).
			Ref("battle_rooms_hosted").
			Unique().
			Required(),
	}
}

// Indexes of the BattleRoom.
func (BattleRoom) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("room_code"),
		index.Fields("status"),
	}
}
