package services

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"time"

	"cloud.google.com/go/storage"
	"google.golang.org/api/option"

	"gigaboo.io/lem/internal/config"
)

// StorageService handles Google Cloud Storage operations.
type StorageService struct {
	cfg    *config.Config
	client *storage.Client
	bucket *storage.BucketHandle
}

// NewStorageService creates a new storage service.
func NewStorageService(cfg *config.Config) (*StorageService, error) {
	if cfg.GCSCredentialsPath == "" || cfg.GCSBucketName == "" {
		return &StorageService{cfg: cfg}, nil
	}

	ctx := context.Background()
	client, err := storage.NewClient(ctx, option.WithCredentialsFile(cfg.GCSCredentialsPath))
	if err != nil {
		return nil, fmt.Errorf("failed to create storage client: %w", err)
	}

	return &StorageService{
		cfg:    cfg,
		client: client,
		bucket: client.Bucket(cfg.GCSBucketName),
	}, nil
}

// Upload uploads a file to GCS.
func (s *StorageService) Upload(ctx context.Context, path string, data io.Reader, contentType string) error {
	if s.client == nil {
		return fmt.Errorf("storage service not configured")
	}

	obj := s.bucket.Object(path)
	writer := obj.NewWriter(ctx)
	writer.ContentType = contentType

	if _, err := io.Copy(writer, data); err != nil {
		return fmt.Errorf("failed to copy data: %w", err)
	}

	if err := writer.Close(); err != nil {
		return fmt.Errorf("failed to close writer: %w", err)
	}

	return nil
}

// UploadJSON uploads JSON data to GCS.
func (s *StorageService) UploadJSON(ctx context.Context, path string, data interface{}) error {
	if s.client == nil {
		return fmt.Errorf("storage service not configured")
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal JSON: %w", err)
	}

	obj := s.bucket.Object(path)
	writer := obj.NewWriter(ctx)
	writer.ContentType = "application/json"

	if _, err := writer.Write(jsonData); err != nil {
		return fmt.Errorf("failed to write data: %w", err)
	}

	if err := writer.Close(); err != nil {
		return fmt.Errorf("failed to close writer: %w", err)
	}

	return nil
}

// Download downloads a file from GCS.
func (s *StorageService) Download(ctx context.Context, path string) ([]byte, error) {
	if s.client == nil {
		return nil, fmt.Errorf("storage service not configured")
	}

	obj := s.bucket.Object(path)
	reader, err := obj.NewReader(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create reader: %w", err)
	}
	defer reader.Close()

	data, err := io.ReadAll(reader)
	if err != nil {
		return nil, fmt.Errorf("failed to read data: %w", err)
	}

	return data, nil
}

// Delete deletes a file from GCS.
func (s *StorageService) Delete(ctx context.Context, path string) error {
	if s.client == nil {
		return fmt.Errorf("storage service not configured")
	}

	obj := s.bucket.Object(path)
	if err := obj.Delete(ctx); err != nil {
		return fmt.Errorf("failed to delete object: %w", err)
	}

	return nil
}

// GenerateSignedURL generates a signed URL for temporary access.
func (s *StorageService) GenerateSignedURL(ctx context.Context, path string, expiration time.Duration) (string, error) {
	if s.client == nil {
		return "", fmt.Errorf("storage service not configured")
	}

	opts := &storage.SignedURLOptions{
		Method:  "GET",
		Expires: time.Now().Add(expiration),
	}

	url, err := s.bucket.SignedURL(path, opts)
	if err != nil {
		return "", fmt.Errorf("failed to generate signed URL: %w", err)
	}

	return url, nil
}

// ListFiles lists files in a given prefix/folder.
func (s *StorageService) ListFiles(ctx context.Context, prefix string) ([]string, error) {
	if s.client == nil {
		return nil, fmt.Errorf("storage service not configured")
	}

	var files []string
	it := s.bucket.Objects(ctx, &storage.Query{Prefix: prefix})
	for {
		attrs, err := it.Next()
		if err == storage.ErrObjectNotExist {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("failed to iterate objects: %w", err)
		}
		files = append(files, attrs.Name)
	}

	return files, nil
}

// GetUserPath returns the storage path for a user file.
func (s *StorageService) GetUserPath(appID, userID int, folder, filename string) string {
	return fmt.Sprintf("app_%d/users/user_%d/%s/%s", appID, userID, folder, filename)
}

// GetSharedPath returns the storage path for a shared file.
func (s *StorageService) GetSharedPath(appID int, filename string) string {
	return fmt.Sprintf("app_%d/shared/%s", appID, filename)
}

// GetConfigPath returns the storage path for a config file.
func (s *StorageService) GetConfigPath(appID int, filename string) string {
	return fmt.Sprintf("app_%d/config/%s", appID, filename)
}

// Close closes the storage client.
func (s *StorageService) Close() error {
	if s.client != nil {
		return s.client.Close()
	}
	return nil
}
