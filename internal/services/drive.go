package services

import (
	"context"
	"fmt"
	"io"

	"golang.org/x/oauth2"
	"google.golang.org/api/drive/v3"
	"google.golang.org/api/option"

	"gigaboo.io/lem/internal/config"
)

// DriveService handles Google Drive operations.
type DriveService struct {
	cfg         *config.Config
	googleOAuth *GoogleOAuthService
}

// NewDriveService creates a new Drive service.
func NewDriveService(cfg *config.Config, googleOAuth *GoogleOAuthService) *DriveService {
	return &DriveService{
		cfg:         cfg,
		googleOAuth: googleOAuth,
	}
}

// DriveFile represents a file in Google Drive.
type DriveFile struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	MimeType     string   `json:"mimeType"`
	Size         int64    `json:"size"`
	CreatedTime  string   `json:"createdTime"`
	ModifiedTime string   `json:"modifiedTime"`
	WebViewLink  string   `json:"webViewLink"`
	IconLink     string   `json:"iconLink"`
	Parents      []string `json:"parents"`
}

// ListFilesInput represents list files request.
type ListFilesInput struct {
	Query     string `json:"query"`
	PageSize  int    `json:"page_size"`
	PageToken string `json:"page_token"`
	FolderID  string `json:"folder_id"`
}

// ListFilesResponse represents list files response.
type ListFilesResponse struct {
	Files         []*DriveFile `json:"files"`
	NextPageToken string       `json:"next_page_token"`
}

// ListFiles lists files in user's Google Drive.
func (s *DriveService) ListFiles(ctx context.Context, userID int, input ListFilesInput) (*ListFilesResponse, error) {
	driveClient, err := s.getDriveClient(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Build query
	query := ""
	if input.FolderID != "" {
		query = fmt.Sprintf("'%s' in parents", input.FolderID)
	}
	if input.Query != "" {
		if query != "" {
			query += " and "
		}
		query += input.Query
	}
	if query != "" {
		query += " and trashed = false"
	} else {
		query = "trashed = false"
	}

	pageSize := input.PageSize
	if pageSize <= 0 {
		pageSize = 100
	}

	call := driveClient.Files.List().
		Q(query).
		PageSize(int64(pageSize)).
		Fields("nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, iconLink, parents)")

	if input.PageToken != "" {
		call = call.PageToken(input.PageToken)
	}

	resp, err := call.Context(ctx).Do()
	if err != nil {
		return nil, fmt.Errorf("failed to list files: %w", err)
	}

	files := make([]*DriveFile, len(resp.Files))
	for i, f := range resp.Files {
		files[i] = &DriveFile{
			ID:           f.Id,
			Name:         f.Name,
			MimeType:     f.MimeType,
			Size:         f.Size,
			CreatedTime:  f.CreatedTime,
			ModifiedTime: f.ModifiedTime,
			WebViewLink:  f.WebViewLink,
			IconLink:     f.IconLink,
			Parents:      f.Parents,
		}
	}

	return &ListFilesResponse{
		Files:         files,
		NextPageToken: resp.NextPageToken,
	}, nil
}

// GetFile gets a file's metadata from Google Drive.
func (s *DriveService) GetFile(ctx context.Context, userID int, fileID string) (*DriveFile, error) {
	driveClient, err := s.getDriveClient(ctx, userID)
	if err != nil {
		return nil, err
	}

	f, err := driveClient.Files.Get(fileID).
		Fields("id, name, mimeType, size, createdTime, modifiedTime, webViewLink, iconLink, parents").
		Context(ctx).
		Do()
	if err != nil {
		return nil, fmt.Errorf("failed to get file: %w", err)
	}

	return &DriveFile{
		ID:           f.Id,
		Name:         f.Name,
		MimeType:     f.MimeType,
		Size:         f.Size,
		CreatedTime:  f.CreatedTime,
		ModifiedTime: f.ModifiedTime,
		WebViewLink:  f.WebViewLink,
		IconLink:     f.IconLink,
		Parents:      f.Parents,
	}, nil
}

// DownloadFile downloads a file's content from Google Drive.
func (s *DriveService) DownloadFile(ctx context.Context, userID int, fileID string) (io.ReadCloser, error) {
	driveClient, err := s.getDriveClient(ctx, userID)
	if err != nil {
		return nil, err
	}

	resp, err := driveClient.Files.Get(fileID).
		Context(ctx).
		Download()
	if err != nil {
		return nil, fmt.Errorf("failed to download file: %w", err)
	}

	return resp.Body, nil
}

// ExportFile exports a Google Workspace document to a specific format.
func (s *DriveService) ExportFile(ctx context.Context, userID int, fileID, mimeType string) (io.ReadCloser, error) {
	driveClient, err := s.getDriveClient(ctx, userID)
	if err != nil {
		return nil, err
	}

	resp, err := driveClient.Files.Export(fileID, mimeType).
		Context(ctx).
		Download()
	if err != nil {
		return nil, fmt.Errorf("failed to export file: %w", err)
	}

	return resp.Body, nil
}

// SearchFiles searches for files in Google Drive.
func (s *DriveService) SearchFiles(ctx context.Context, userID int, searchTerm string, pageSize int) (*ListFilesResponse, error) {
	query := fmt.Sprintf("fullText contains '%s' and trashed = false", searchTerm)
	return s.ListFiles(ctx, userID, ListFilesInput{
		Query:    query,
		PageSize: pageSize,
	})
}

func (s *DriveService) getDriveClient(ctx context.Context, userID int) (*drive.Service, error) {
	accessToken, err := s.googleOAuth.GetValidToken(ctx, userID)
	if err != nil {
		return nil, err
	}

	tokenSource := oauth2.StaticTokenSource(&oauth2.Token{AccessToken: accessToken})
	return drive.NewService(ctx, option.WithTokenSource(tokenSource))
}
