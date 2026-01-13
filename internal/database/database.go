package database

import (
	"context"
	"fmt"
	"log"

	"entgo.io/ent/dialect"
	"entgo.io/ent/dialect/sql"
	_ "github.com/lib/pq"

	"gigaboo.io/lem/internal/config"
	"gigaboo.io/lem/internal/ent"
	"gigaboo.io/lem/internal/ent/migrate"
)

// Connect creates a new database connection using the config.
func Connect(cfg *config.Config) (*ent.Client, error) {
	// Open connection to PostgreSQL
	drv, err := sql.Open(dialect.Postgres, cfg.DatabaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed opening connection to postgres: %w", err)
	}

	// Create ent client
	client := ent.NewClient(ent.Driver(drv))

	return client, nil
}

// Migrate runs auto-migration on the database schema.
func Migrate(ctx context.Context, client *ent.Client) error {
	log.Println("Running database migrations...")

	err := client.Schema.Create(
		ctx,
		migrate.WithDropIndex(true),
		migrate.WithDropColumn(true),
	)
	if err != nil {
		return fmt.Errorf("failed creating schema resources: %w", err)
	}

	log.Println("Database migrations completed successfully")
	return nil
}

// Close closes the database connection.
func Close(client *ent.Client) error {
	return client.Close()
}
