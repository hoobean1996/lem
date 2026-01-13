package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"gigaboo.io/lem/internal/config"
	"gigaboo.io/lem/internal/database"
	"gigaboo.io/lem/internal/routes"
)

func main() {
	// Parse command line flags
	env := flag.String("env", "local", "Environment: local or prod")
	flag.Parse()

	// Load configuration
	cfg, err := config.Load(*env)
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	log.Printf("Starting %s in %s mode", cfg.AppName, cfg.Env)

	// Connect to database
	client, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close(client)

	// Run migrations
	ctx := context.Background()
	if err := database.Migrate(ctx, client); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Setup router
	router := routes.SetupRouter(cfg, client)

	// Create HTTP server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	go func() {
		log.Printf("Server listening on port %s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	// Give outstanding requests 30 seconds to complete
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited gracefully")
}
