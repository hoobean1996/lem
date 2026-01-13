package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"gigaboo.io/lem/internal/middleware"
	"gigaboo.io/lem/internal/services"
)

// StorageHandler handles storage endpoints.
type StorageHandler struct {
	storageService *services.StorageService
}

// NewStorageHandler creates a new storage handler.
func NewStorageHandler(storageService *services.StorageService) *StorageHandler {
	return &StorageHandler{
		storageService: storageService,
	}
}

// Upload handles file upload.
func (h *StorageHandler) Upload(c *gin.Context) {
	app := middleware.GetAppFromGin(c)
	user := middleware.GetUserFromGin(c)
	if app == nil || user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file required"})
		return
	}
	defer file.Close()

	folder := c.PostForm("folder")
	if folder == "" {
		folder = "uploads"
	}

	path := h.storageService.GetUserPath(app.ID, user.ID, folder, header.Filename)
	contentType := header.Header.Get("Content-Type")

	err = h.storageService.Upload(c.Request.Context(), path, file, contentType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"path":     path,
		"filename": header.Filename,
		"size":     header.Size,
	})
}

// Download handles file download.
func (h *StorageHandler) Download(c *gin.Context) {
	app := middleware.GetAppFromGin(c)
	user := middleware.GetUserFromGin(c)
	if app == nil || user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	path := c.Query("path")
	if path == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "path required"})
		return
	}

	data, err := h.storageService.Download(c.Request.Context(), path)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/octet-stream", data)
}

// Delete handles file deletion.
func (h *StorageHandler) Delete(c *gin.Context) {
	app := middleware.GetAppFromGin(c)
	user := middleware.GetUserFromGin(c)
	if app == nil || user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	path := c.Param("path")
	if path == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "path required"})
		return
	}

	err := h.storageService.Delete(c.Request.Context(), path)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// ListFiles handles listing files.
func (h *StorageHandler) ListFiles(c *gin.Context) {
	app := middleware.GetAppFromGin(c)
	user := middleware.GetUserFromGin(c)
	if app == nil || user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	prefix := c.Query("prefix")
	if prefix == "" {
		prefix = h.storageService.GetUserPath(app.ID, user.ID, "", "")
	}

	files, err := h.storageService.ListFiles(c.Request.Context(), prefix)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"files": files})
}

// GetSignedURL generates a signed URL for file access.
func (h *StorageHandler) GetSignedURL(c *gin.Context) {
	app := middleware.GetAppFromGin(c)
	user := middleware.GetUserFromGin(c)
	if app == nil || user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	path := c.Query("path")
	if path == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "path required"})
		return
	}

	url, err := h.storageService.GenerateSignedURL(c.Request.Context(), path, 15*time.Minute)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"url": url})
}
