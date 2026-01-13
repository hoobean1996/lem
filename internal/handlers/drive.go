package handlers

import (
	"io"
	"net/http"

	"github.com/gin-gonic/gin"

	"gigaboo.io/lem/internal/middleware"
	"gigaboo.io/lem/internal/services"
)

// DriveHandler handles Google Drive endpoints.
type DriveHandler struct {
	driveService *services.DriveService
}

// NewDriveHandler creates a new Drive handler.
func NewDriveHandler(driveService *services.DriveService) *DriveHandler {
	return &DriveHandler{
		driveService: driveService,
	}
}

// ListFiles lists files in user's Google Drive.
func (h *DriveHandler) ListFiles(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	input := services.ListFilesInput{
		Query:     c.Query("query"),
		PageToken: c.Query("page_token"),
		FolderID:  c.Query("folder_id"),
		PageSize:  100,
	}

	resp, err := h.driveService.ListFiles(c.Request.Context(), user.ID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

// GetFile gets a file's metadata.
func (h *DriveHandler) GetFile(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	fileID := c.Param("file_id")
	if fileID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file_id required"})
		return
	}

	file, err := h.driveService.GetFile(c.Request.Context(), user.ID, fileID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, file)
}

// DownloadFile downloads a file's content.
func (h *DriveHandler) DownloadFile(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	fileID := c.Param("file_id")
	if fileID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file_id required"})
		return
	}

	reader, err := h.driveService.DownloadFile(c.Request.Context(), user.ID, fileID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer reader.Close()

	c.Header("Content-Type", "application/octet-stream")
	io.Copy(c.Writer, reader)
}

// ExportFile exports a Google Workspace document.
func (h *DriveHandler) ExportFile(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	fileID := c.Param("file_id")
	mimeType := c.Query("mime_type")
	if fileID == "" || mimeType == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file_id and mime_type required"})
		return
	}

	reader, err := h.driveService.ExportFile(c.Request.Context(), user.ID, fileID, mimeType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer reader.Close()

	c.Header("Content-Type", mimeType)
	io.Copy(c.Writer, reader)
}

// SearchFiles searches for files.
func (h *DriveHandler) SearchFiles(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query required"})
		return
	}

	resp, err := h.driveService.SearchFiles(c.Request.Context(), user.ID, query, 100)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}
