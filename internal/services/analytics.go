package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"gigaboo.io/lem/internal/config"
)

// AnalyticsService handles Google Analytics 4 tracking.
type AnalyticsService struct {
	cfg *config.Config
}

// NewAnalyticsService creates a new analytics service.
func NewAnalyticsService(cfg *config.Config) *AnalyticsService {
	return &AnalyticsService{cfg: cfg}
}

// GA4Event represents a Google Analytics 4 event.
type GA4Event struct {
	Name   string                 `json:"name"`
	Params map[string]interface{} `json:"params,omitempty"`
}

// GA4Payload represents the GA4 Measurement Protocol payload.
type GA4Payload struct {
	ClientID string     `json:"client_id"`
	UserID   string     `json:"user_id,omitempty"`
	Events   []GA4Event `json:"events"`
}

// TrackEvent sends an event to Google Analytics 4.
func (s *AnalyticsService) TrackEvent(ctx context.Context, clientID, userID, eventName string, params map[string]interface{}) error {
	if s.cfg.GAMeasurementID == "" || s.cfg.GAAPISecret == "" {
		return nil // Analytics not configured
	}

	payload := GA4Payload{
		ClientID: clientID,
		UserID:   userID,
		Events: []GA4Event{
			{
				Name:   eventName,
				Params: params,
			},
		},
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	url := fmt.Sprintf(
		"https://www.google-analytics.com/mp/collect?measurement_id=%s&api_secret=%s",
		s.cfg.GAMeasurementID,
		s.cfg.GAAPISecret,
	)

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	return nil
}

// TrackSignup tracks a user signup event.
func (s *AnalyticsService) TrackSignup(ctx context.Context, clientID, userID, method string) error {
	return s.TrackEvent(ctx, clientID, userID, "sign_up", map[string]interface{}{
		"method": method,
	})
}

// TrackLogin tracks a user login event.
func (s *AnalyticsService) TrackLogin(ctx context.Context, clientID, userID, method string) error {
	return s.TrackEvent(ctx, clientID, userID, "login", map[string]interface{}{
		"method": method,
	})
}

// TrackAppEnabled tracks when a user enables an app.
func (s *AnalyticsService) TrackAppEnabled(ctx context.Context, clientID, userID, appSlug string) error {
	return s.TrackEvent(ctx, clientID, userID, "app_enabled", map[string]interface{}{
		"app_slug": appSlug,
	})
}

// TrackSubscription tracks subscription events.
func (s *AnalyticsService) TrackSubscription(ctx context.Context, clientID, userID, planName, action string, value float64) error {
	return s.TrackEvent(ctx, clientID, userID, "subscription", map[string]interface{}{
		"plan_name": planName,
		"action":    action,
		"value":     value,
	})
}

// TrackPageView tracks a page view.
func (s *AnalyticsService) TrackPageView(ctx context.Context, clientID, userID, pageTitle, pageLocation string) error {
	return s.TrackEvent(ctx, clientID, userID, "page_view", map[string]interface{}{
		"page_title":    pageTitle,
		"page_location": pageLocation,
	})
}
