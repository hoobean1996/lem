package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"

	"github.com/stripe/stripe-go/v81"
	billingSession "github.com/stripe/stripe-go/v81/billingportal/session"
	"github.com/stripe/stripe-go/v81/checkout/session"
	"github.com/stripe/stripe-go/v81/customer"
	"github.com/stripe/stripe-go/v81/webhook"

	"gigaboo.io/lem/internal/config"
	"gigaboo.io/lem/internal/ent"
	"gigaboo.io/lem/internal/ent/plan"
	"gigaboo.io/lem/internal/ent/subscription"
)

// StripeService handles Stripe operations.
type StripeService struct {
	cfg    *config.Config
	client *ent.Client
}

// NewStripeService creates a new Stripe service.
func NewStripeService(cfg *config.Config, client *ent.Client) *StripeService {
	stripe.Key = cfg.StripeSecretKey
	return &StripeService{
		cfg:    cfg,
		client: client,
	}
}

// CreateCheckoutInput represents checkout session request.
type CreateCheckoutInput struct {
	PlanID     int    `json:"plan_id" binding:"required"`
	SuccessURL string `json:"success_url" binding:"required"`
	CancelURL  string `json:"cancel_url" binding:"required"`
}

// CreateCheckoutSession creates a Stripe checkout session.
func (s *StripeService) CreateCheckoutSession(ctx context.Context, appID, userID int, input CreateCheckoutInput) (*stripe.CheckoutSession, error) {
	// Get plan
	p, err := s.client.Plan.Get(ctx, input.PlanID)
	if err != nil {
		return nil, errors.New("plan not found")
	}

	if p.StripePriceID == "" {
		return nil, errors.New("plan has no Stripe price ID")
	}

	// Get or create Stripe customer
	customerID, err := s.getOrCreateCustomer(ctx, appID, userID)
	if err != nil {
		return nil, err
	}

	// Create checkout session
	params := &stripe.CheckoutSessionParams{
		Customer: stripe.String(customerID),
		Mode:     stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(p.StripePriceID),
				Quantity: stripe.Int64(1),
			},
		},
		SuccessURL: stripe.String(input.SuccessURL),
		CancelURL:  stripe.String(input.CancelURL),
		Metadata: map[string]string{
			"app_id":  fmt.Sprintf("%d", appID),
			"user_id": fmt.Sprintf("%d", userID),
			"plan_id": fmt.Sprintf("%d", input.PlanID),
		},
	}

	return session.New(params)
}

// CreatePortalSession creates a Stripe billing portal session.
func (s *StripeService) CreatePortalSession(ctx context.Context, appID, userID int, returnURL string) (*stripe.BillingPortalSession, error) {
	// Get Stripe customer ID from user app
	userApps, err := s.client.UserApp.Query().
		Where().
		WithUser().
		All(ctx)
	if err != nil {
		return nil, errors.New("user app not found")
	}

	var customerID string
	for _, ua := range userApps {
		if ua.Edges.User != nil && ua.Edges.User.ID == userID && ua.StripeCustomerID != "" {
			customerID = ua.StripeCustomerID
			break
		}
	}

	if customerID == "" {
		return nil, errors.New("no Stripe customer found")
	}

	params := &stripe.BillingPortalSessionParams{
		Customer:  stripe.String(customerID),
		ReturnURL: stripe.String(returnURL),
	}

	return billingSession.New(params)
}

// HandleWebhook processes Stripe webhook events.
func (s *StripeService) HandleWebhook(ctx context.Context, body io.Reader, signature string) error {
	payload, err := io.ReadAll(body)
	if err != nil {
		return err
	}

	event, err := webhook.ConstructEvent(payload, signature, s.cfg.StripeWebhookSecret)
	if err != nil {
		return err
	}

	switch event.Type {
	case "checkout.session.completed":
		var cs stripe.CheckoutSession
		if err := json.Unmarshal(event.Data.Raw, &cs); err != nil {
			return err
		}
		return s.handleCheckoutCompleted(ctx, &cs)

	case "customer.subscription.updated":
		var sub stripe.Subscription
		if err := json.Unmarshal(event.Data.Raw, &sub); err != nil {
			return err
		}
		return s.handleSubscriptionUpdated(ctx, &sub)

	case "customer.subscription.deleted":
		var sub stripe.Subscription
		if err := json.Unmarshal(event.Data.Raw, &sub); err != nil {
			return err
		}
		return s.handleSubscriptionDeleted(ctx, &sub)
	}

	return nil
}

func (s *StripeService) getOrCreateCustomer(ctx context.Context, appID, userID int) (string, error) {
	// Check if user already has a Stripe customer ID
	userApps, err := s.client.UserApp.Query().
		WithUser().
		All(ctx)
	if err == nil {
		for _, ua := range userApps {
			if ua.Edges.User != nil && ua.Edges.User.ID == userID && ua.StripeCustomerID != "" {
				return ua.StripeCustomerID, nil
			}
		}
	}

	// Get user
	u, err := s.client.User.Get(ctx, userID)
	if err != nil {
		return "", err
	}

	// Create Stripe customer
	params := &stripe.CustomerParams{
		Email: stripe.String(u.Email),
		Name:  stripe.String(u.Name),
		Metadata: map[string]string{
			"app_id":  fmt.Sprintf("%d", appID),
			"user_id": fmt.Sprintf("%d", userID),
		},
	}

	cust, err := customer.New(params)
	if err != nil {
		return "", err
	}

	return cust.ID, nil
}

func (s *StripeService) handleCheckoutCompleted(ctx context.Context, cs *stripe.CheckoutSession) error {
	// Parse metadata
	var appID, userID, planID int
	fmt.Sscanf(cs.Metadata["app_id"], "%d", &appID)
	fmt.Sscanf(cs.Metadata["user_id"], "%d", &userID)
	fmt.Sscanf(cs.Metadata["plan_id"], "%d", &planID)

	// Get plan
	p, err := s.client.Plan.Get(ctx, planID)
	if err != nil {
		return err
	}

	// Create subscription record
	_, err = s.client.Subscription.Create().
		SetUserID(userID).
		SetAppID(appID).
		SetPlanID(p.ID).
		SetStripeSubscriptionID(cs.Subscription.ID).
		SetStatus(subscription.StatusACTIVE).
		Save(ctx)

	return err
}

func (s *StripeService) handleSubscriptionUpdated(ctx context.Context, sub *stripe.Subscription) error {
	// Find subscription by Stripe ID
	existing, err := s.client.Subscription.Query().
		Where(subscription.StripeSubscriptionID(sub.ID)).
		First(ctx)
	if err != nil {
		return nil // Subscription not found, ignore
	}

	// Map Stripe status to our status
	var status subscription.Status
	switch sub.Status {
	case stripe.SubscriptionStatusActive:
		status = subscription.StatusACTIVE
	case stripe.SubscriptionStatusCanceled:
		status = subscription.StatusCANCELED
	case stripe.SubscriptionStatusPastDue:
		status = subscription.StatusPAST_DUE
	case stripe.SubscriptionStatusTrialing:
		status = subscription.StatusTRIALING
	case stripe.SubscriptionStatusIncomplete:
		status = subscription.StatusINCOMPLETE
	default:
		status = subscription.StatusACTIVE
	}

	// Update subscription
	_, err = s.client.Subscription.UpdateOne(existing).
		SetStatus(status).
		Save(ctx)

	return err
}

func (s *StripeService) handleSubscriptionDeleted(ctx context.Context, sub *stripe.Subscription) error {
	// Find subscription by Stripe ID
	existing, err := s.client.Subscription.Query().
		Where(subscription.StripeSubscriptionID(sub.ID)).
		First(ctx)
	if err != nil {
		return nil // Subscription not found, ignore
	}

	// Update status to canceled
	_, err = s.client.Subscription.UpdateOne(existing).
		SetStatus(subscription.StatusCANCELED).
		Save(ctx)

	return err
}

// GetPlans returns all active plans for an app.
func (s *StripeService) GetPlans(ctx context.Context, appID int) ([]*ent.Plan, error) {
	return s.client.Plan.Query().
		Where(plan.IsActive(true)).
		All(ctx)
}

// GetCurrentSubscription returns the current active subscription for a user.
func (s *StripeService) GetCurrentSubscription(ctx context.Context, appID, userID int) (*ent.Subscription, error) {
	return s.client.Subscription.Query().
		Where(
			subscription.StatusIn(
				subscription.StatusACTIVE,
				subscription.StatusTRIALING,
			),
		).
		WithPlan().
		WithUser().
		First(ctx)
}
