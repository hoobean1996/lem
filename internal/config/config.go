package config

import (
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

// Config holds all configuration for the application.
type Config struct {
	// Server
	Env        string
	AppName    string
	Debug      bool
	APIVersion string
	BaseURL    string
	Port       string

	// Database
	DatabaseURL string

	// JWT
	JWTSecretKey             string
	JWTAlgorithm             string
	AccessTokenExpireMinutes int
	RefreshTokenExpireDays   int

	// Stripe
	StripeSecretKey      string
	StripeWebhookSecret  string
	StripePublishableKey string

	// Google OAuth
	GoogleClientID     string
	GoogleClientSecret string

	// Google Cloud Storage
	GCSCredentialsPath string
	GCSBucketName      string

	// Google Analytics
	GAMeasurementID string
	GAAPISecret     string

	// Google Marketplace
	GoogleMarketplaceAppID string

	// SMTP
	SMTPHost      string
	SMTPPort      int
	SMTPUser      string
	SMTPPassword  string
	SMTPFromEmail string
	SMTPFromName  string

	// CORS
	CORSOrigins []string

	// Admin
	AdminEmails []string
}

// Load loads configuration from environment variables.
// env parameter: "local" or "prod"
func Load(env string) (*Config, error) {
	// Load environment-specific .env file first, then base .env
	if env == "prod" {
		_ = godotenv.Load(".env.prod")
	} else {
		_ = godotenv.Load(".env.local")
	}
	// Also load base .env as fallback
	_ = godotenv.Load(".env")

	cfg := &Config{
		// Server
		Env:        env,
		AppName:    getEnv("APP_NAME", "Lemonade API"),
		Debug:      getEnvBool("DEBUG", true),
		APIVersion: getEnv("API_VERSION", "v1"),
		BaseURL:    getEnv("API_BASE_URL", "http://localhost:8080"),
		Port:       getEnv("PORT", "8080"),

		// Database
		DatabaseURL: getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/lemonade?sslmode=disable"),

		// JWT
		JWTSecretKey:             getEnv("JWT_SECRET_KEY", "your-secret-key-change-in-production"),
		JWTAlgorithm:             getEnv("JWT_ALGORITHM", "HS256"),
		AccessTokenExpireMinutes: getEnvInt("ACCESS_TOKEN_EXPIRE_MINUTES", 30),
		RefreshTokenExpireDays:   getEnvInt("REFRESH_TOKEN_EXPIRE_DAYS", 7),

		// Stripe
		StripeSecretKey:      getEnv("STRIPE_SECRET_KEY", ""),
		StripeWebhookSecret:  getEnv("STRIPE_WEBHOOK_SECRET", ""),
		StripePublishableKey: getEnv("STRIPE_PUBLISHABLE_KEY", ""),

		// Google OAuth
		GoogleClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),

		// Google Cloud Storage
		GCSCredentialsPath: getEnv("GCS_CREDENTIALS_PATH", ""),
		GCSBucketName:      getEnv("GCS_BUCKET_NAME", ""),

		// Google Analytics
		GAMeasurementID: getEnv("GA_MEASUREMENT_ID", ""),
		GAAPISecret:     getEnv("GA_API_SECRET", ""),

		// Google Marketplace
		GoogleMarketplaceAppID: getEnv("GOOGLE_MARKETPLACE_APP_ID", ""),

		// SMTP
		SMTPHost:      getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:      getEnvInt("SMTP_PORT", 587),
		SMTPUser:      getEnv("SMTP_USER", ""),
		SMTPPassword:  getEnv("SMTP_PASSWORD", ""),
		SMTPFromEmail: getEnv("SMTP_FROM_EMAIL", ""),
		SMTPFromName:  getEnv("SMTP_FROM_NAME", "Lemonade"),

		// CORS
		CORSOrigins: getEnvSlice("CORS_ORIGINS", []string{"http://localhost:3000", "http://localhost:5173"}),

		// Admin
		AdminEmails: getEnvSlice("ADMIN_EMAILS", []string{}),
	}

	return cfg, nil
}

// AccessTokenDuration returns the access token duration.
func (c *Config) AccessTokenDuration() time.Duration {
	return time.Duration(c.AccessTokenExpireMinutes) * time.Minute
}

// RefreshTokenDuration returns the refresh token duration.
func (c *Config) RefreshTokenDuration() time.Duration {
	return time.Duration(c.RefreshTokenExpireDays) * 24 * time.Hour
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		b, err := strconv.ParseBool(value)
		if err != nil {
			return defaultValue
		}
		return b
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		i, err := strconv.Atoi(value)
		if err != nil {
			return defaultValue
		}
		return i
	}
	return defaultValue
}

func getEnvSlice(key string, defaultValue []string) []string {
	if value := os.Getenv(key); value != "" {
		// Remove brackets if present (JSON format)
		value = strings.Trim(value, "[]")
		// Split by comma and clean up
		parts := strings.Split(value, ",")
		result := make([]string, 0, len(parts))
		for _, part := range parts {
			cleaned := strings.Trim(strings.TrimSpace(part), "\"'")
			if cleaned != "" {
				result = append(result, cleaned)
			}
		}
		return result
	}
	return defaultValue
}
