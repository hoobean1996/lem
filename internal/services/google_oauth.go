package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"

	"gigaboo.io/lem/internal/config"
	"gigaboo.io/lem/internal/ent"
	"gigaboo.io/lem/internal/ent/user"
)

// GoogleOAuthService handles Google OAuth operations.
type GoogleOAuthService struct {
	cfg         *config.Config
	client      *ent.Client
	oauthConfig *oauth2.Config
}

// Google OAuth scopes
var googleScopes = []string{
	"https://www.googleapis.com/auth/userinfo.email",
	"https://www.googleapis.com/auth/userinfo.profile",
	"https://www.googleapis.com/auth/drive.readonly",
	"https://www.googleapis.com/auth/drive.file",
	"https://www.googleapis.com/auth/documents.readonly",
	"https://www.googleapis.com/auth/spreadsheets.readonly",
	"https://www.googleapis.com/auth/presentations.readonly",
}

// GoogleUserInfo represents Google user info response.
type GoogleUserInfo struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
}

// NewGoogleOAuthService creates a new Google OAuth service.
func NewGoogleOAuthService(cfg *config.Config, client *ent.Client) *GoogleOAuthService {
	oauthConfig := &oauth2.Config{
		ClientID:     cfg.GoogleClientID,
		ClientSecret: cfg.GoogleClientSecret,
		Scopes:       googleScopes,
		Endpoint:     google.Endpoint,
	}

	return &GoogleOAuthService{
		cfg:         cfg,
		client:      client,
		oauthConfig: oauthConfig,
	}
}

// GetAuthorizationURL returns the Google OAuth authorization URL.
func (s *GoogleOAuthService) GetAuthorizationURL(redirectURI, state string) string {
	s.oauthConfig.RedirectURL = redirectURI
	return s.oauthConfig.AuthCodeURL(state, oauth2.AccessTypeOffline, oauth2.ApprovalForce)
}

// ExchangeCodeInput represents code exchange request.
type ExchangeCodeInput struct {
	Code        string `json:"code" binding:"required"`
	RedirectURI string `json:"redirect_uri" binding:"required"`
}

// ExchangeCode exchanges authorization code for tokens and user info.
func (s *GoogleOAuthService) ExchangeCode(ctx context.Context, input ExchangeCodeInput) (*ent.User, *oauth2.Token, error) {
	s.oauthConfig.RedirectURL = input.RedirectURI

	// Exchange code for token
	token, err := s.oauthConfig.Exchange(ctx, input.Code)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to exchange code: %w", err)
	}

	// Get user info
	userInfo, err := s.getUserInfo(ctx, token)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to get user info: %w", err)
	}

	// Find or create user
	u, err := s.findOrCreateUser(ctx, userInfo, token)
	if err != nil {
		return nil, nil, err
	}

	return u, token, nil
}

// RefreshToken refreshes the access token using refresh token.
func (s *GoogleOAuthService) RefreshToken(ctx context.Context, userID int) (*oauth2.Token, error) {
	u, err := s.client.User.Get(ctx, userID)
	if err != nil {
		return nil, err
	}

	if u.GoogleRefreshToken == "" {
		return nil, errors.New("no refresh token available")
	}

	// Create token source
	token := &oauth2.Token{
		RefreshToken: u.GoogleRefreshToken,
	}

	tokenSource := s.oauthConfig.TokenSource(ctx, token)
	newToken, err := tokenSource.Token()
	if err != nil {
		return nil, fmt.Errorf("failed to refresh token: %w", err)
	}

	// Update user with new token
	_, err = s.client.User.UpdateOne(u).
		SetGoogleAccessToken(newToken.AccessToken).
		SetGoogleTokenExpiresAt(newToken.Expiry).
		Save(ctx)
	if err != nil {
		return nil, err
	}

	return newToken, nil
}

// GetValidToken returns a valid access token, refreshing if necessary.
func (s *GoogleOAuthService) GetValidToken(ctx context.Context, userID int) (string, error) {
	u, err := s.client.User.Get(ctx, userID)
	if err != nil {
		return "", err
	}

	if u.GoogleAccessToken == "" {
		return "", errors.New("no Google access token")
	}

	// Check if token is expired
	if u.GoogleTokenExpiresAt != nil && time.Now().After(*u.GoogleTokenExpiresAt) {
		newToken, err := s.RefreshToken(ctx, userID)
		if err != nil {
			return "", err
		}
		return newToken.AccessToken, nil
	}

	return u.GoogleAccessToken, nil
}

func (s *GoogleOAuthService) getUserInfo(ctx context.Context, token *oauth2.Token) (*GoogleUserInfo, error) {
	client := s.oauthConfig.Client(ctx, token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get user info: %s", resp.Status)
	}

	var userInfo GoogleUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, err
	}

	return &userInfo, nil
}

func (s *GoogleOAuthService) findOrCreateUser(ctx context.Context, info *GoogleUserInfo, token *oauth2.Token) (*ent.User, error) {
	// Try to find user by Google ID
	u, err := s.client.User.Query().
		Where(user.GoogleID(info.ID)).
		First(ctx)
	if err == nil {
		// Update user with new token
		return s.client.User.UpdateOne(u).
			SetGoogleAccessToken(token.AccessToken).
			SetGoogleRefreshToken(token.RefreshToken).
			SetGoogleTokenExpiresAt(token.Expiry).
			SetLastLoginAt(time.Now()).
			Save(ctx)
	}

	// Try to find user by email
	u, err = s.client.User.Query().
		Where(user.Email(info.Email)).
		First(ctx)
	if err == nil {
		// Link Google account and update tokens
		return s.client.User.UpdateOne(u).
			SetGoogleID(info.ID).
			SetGoogleAccessToken(token.AccessToken).
			SetGoogleRefreshToken(token.RefreshToken).
			SetGoogleTokenExpiresAt(token.Expiry).
			SetLastLoginAt(time.Now()).
			Save(ctx)
	}

	// Create new user
	return s.client.User.Create().
		SetEmail(info.Email).
		SetName(info.Name).
		SetAvatarURL(info.Picture).
		SetGoogleID(info.ID).
		SetGoogleAccessToken(token.AccessToken).
		SetGoogleRefreshToken(token.RefreshToken).
		SetGoogleTokenExpiresAt(token.Expiry).
		SetIsVerified(info.VerifiedEmail).
		SetLastLoginAt(time.Now()).
		Save(ctx)
}
