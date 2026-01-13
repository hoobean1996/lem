package services

import (
	"context"
	"errors"
	"time"

	"golang.org/x/crypto/bcrypt"

	"gigaboo.io/lem/internal/config"
	"gigaboo.io/lem/internal/ent"
	"gigaboo.io/lem/internal/ent/user"
	"gigaboo.io/lem/internal/middleware"
)

// AuthService handles authentication operations.
type AuthService struct {
	cfg    *config.Config
	client *ent.Client
	auth   *middleware.AuthMiddleware
}

// NewAuthService creates a new auth service.
func NewAuthService(cfg *config.Config, client *ent.Client, auth *middleware.AuthMiddleware) *AuthService {
	return &AuthService{
		cfg:    cfg,
		client: client,
		auth:   auth,
	}
}

// SignupInput represents signup request data.
type SignupInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Name     string `json:"name"`
}

// LoginInput represents login request data.
type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// DeviceLoginInput represents device login request data.
type DeviceLoginInput struct {
	DeviceID string `json:"device_id" binding:"required"`
}

// AuthResponse represents authentication response.
type AuthResponse struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	TokenType    string    `json:"token_type"`
	ExpiresIn    int       `json:"expires_in"`
	User         *ent.User `json:"user"`
}

// Signup creates a new user account.
func (s *AuthService) Signup(ctx context.Context, appID int, input SignupInput) (*AuthResponse, error) {
	// Check if email already exists
	exists, err := s.client.User.Query().
		Where(user.Email(input.Email)).
		Exist(ctx)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("email already registered")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Create user
	u, err := s.client.User.Create().
		SetEmail(input.Email).
		SetPasswordHash(string(hashedPassword)).
		SetName(input.Name).
		SetLastLoginAt(time.Now()).
		Save(ctx)
	if err != nil {
		return nil, err
	}

	// Create user-app association
	_, err = s.client.UserApp.Create().
		SetUserID(u.ID).
		SetAppID(appID).
		Save(ctx)
	if err != nil {
		return nil, err
	}

	// Generate tokens
	return s.generateTokens(u.ID, appID, 0, "")
}

// Login authenticates a user with email and password.
func (s *AuthService) Login(ctx context.Context, appID int, input LoginInput) (*AuthResponse, error) {
	// Find user by email
	u, err := s.client.User.Query().
		Where(user.Email(input.Email)).
		First(ctx)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Verify password
	if u.PasswordHash == "" {
		return nil, errors.New("invalid credentials")
	}
	err = bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(input.Password))
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	if !u.IsActive {
		return nil, errors.New("account is disabled")
	}

	// Update last login
	_, err = s.client.User.UpdateOne(u).
		SetLastLoginAt(time.Now()).
		Save(ctx)
	if err != nil {
		return nil, err
	}

	// Generate tokens
	return s.generateTokens(u.ID, appID, 0, "")
}

// DeviceLogin authenticates a user with device ID.
func (s *AuthService) DeviceLogin(ctx context.Context, appID int, input DeviceLoginInput) (*AuthResponse, error) {
	// Find or create user by device ID
	u, err := s.client.User.Query().
		Where(user.DeviceID(input.DeviceID)).
		First(ctx)

	if err != nil {
		// Create new user with device ID
		u, err = s.client.User.Create().
			SetEmail(input.DeviceID + "@device.local").
			SetDeviceID(input.DeviceID).
			SetLastLoginAt(time.Now()).
			Save(ctx)
		if err != nil {
			return nil, err
		}

		// Create user-app association
		_, err = s.client.UserApp.Create().
			SetUserID(u.ID).
			SetAppID(appID).
			Save(ctx)
		if err != nil {
			return nil, err
		}
	} else {
		// Update last login
		_, err = s.client.User.UpdateOne(u).
			SetLastLoginAt(time.Now()).
			Save(ctx)
		if err != nil {
			return nil, err
		}
	}

	if !u.IsActive {
		return nil, errors.New("account is disabled")
	}

	// Generate tokens
	return s.generateTokens(u.ID, appID, 0, "")
}

// RefreshTokenInput represents refresh token request data.
type RefreshTokenInput struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// RefreshToken generates new tokens from a refresh token.
func (s *AuthService) RefreshToken(ctx context.Context, input RefreshTokenInput) (*AuthResponse, error) {
	// Validate refresh token
	claims, err := s.auth.ValidateToken(input.RefreshToken)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	if claims.Type != "refresh" {
		return nil, errors.New("invalid token type")
	}

	// Get user
	u, err := s.client.User.Get(ctx, claims.UserID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	if !u.IsActive {
		return nil, errors.New("account is disabled")
	}

	// Generate new tokens
	return s.generateTokens(u.ID, claims.AppID, claims.OrgID, claims.OrgRole)
}

// GetMe returns the current user.
func (s *AuthService) GetMe(ctx context.Context, userID int) (*ent.User, error) {
	return s.client.User.Get(ctx, userID)
}

func (s *AuthService) generateTokens(userID, appID, orgID int, orgRole string) (*AuthResponse, error) {
	accessToken, err := s.auth.GenerateAccessToken(userID, appID, orgID, orgRole)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.auth.GenerateRefreshToken(userID, appID, orgID)
	if err != nil {
		return nil, err
	}

	user, err := s.client.User.Get(context.Background(), userID)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		TokenType:    "Bearer",
		ExpiresIn:    s.cfg.AccessTokenExpireMinutes * 60,
		User:         user,
	}, nil
}
