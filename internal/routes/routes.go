package routes

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"

	"gigaboo.io/lem/internal/config"
	"gigaboo.io/lem/internal/ent"
	"gigaboo.io/lem/internal/handlers"
	"gigaboo.io/lem/internal/middleware"
	"gigaboo.io/lem/internal/services"
)

// adminDir is the directory for admin UI static files
const adminDir = "admin-ui/dist"

// shenbiDir is the directory for shenbi static files
const shenbiDir = "shenbi/dist"

// SetupRouter sets up all routes.
func SetupRouter(cfg *config.Config, client *ent.Client) *gin.Engine {
	if !cfg.Debug {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	// Middleware
	r.Use(middleware.CORS(cfg))

	// Services
	auth := middleware.NewAuthMiddleware(cfg, client)
	authService := services.NewAuthService(cfg, client, auth)
	stripeService := services.NewStripeService(cfg, client)
	storageService, _ := services.NewStorageService(cfg)
	googleOAuthService := services.NewGoogleOAuthService(cfg, client)
	driveService := services.NewDriveService(cfg, googleOAuthService)
	emailService := services.NewEmailService(cfg, client)
	orgService := services.NewOrganizationService(cfg, client)
	shenbiService := services.NewShenbiService(cfg, client)
	_ = services.NewAnalyticsService(cfg)

	// Admin auth middleware
	adminAuth := middleware.NewAdminAuthMiddleware(cfg, client)

	// Handlers
	authHandler := handlers.NewAuthHandler(authService, auth)
	subscriptionHandler := handlers.NewSubscriptionHandler(stripeService)
	storageHandler := handlers.NewStorageHandler(storageService)
	googleOAuthHandler := handlers.NewGoogleOAuthHandler(googleOAuthService, auth)
	driveHandler := handlers.NewDriveHandler(driveService)
	emailHandler := handlers.NewEmailHandler(emailService)
	orgHandler := handlers.NewOrganizationHandler(orgService)
	shenbiHandler := handlers.NewShenbiHandler(shenbiService)
	adminHandler := handlers.NewAdminHandler(cfg, client, adminAuth, auth, emailService, storageService)

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API routes
	api := r.Group("/api/" + cfg.APIVersion)
	{
		// Public routes (require API key only)
		public := api.Group("")
		public.Use(auth.APIKeyAuth())
		{
			// Auth routes
			authRoutes := public.Group("/auth")
			{
				authRoutes.POST("/signup", authHandler.Signup)
				authRoutes.POST("/login", authHandler.Login)
				authRoutes.POST("/device", authHandler.DeviceLogin)
				authRoutes.POST("/refresh", authHandler.RefreshToken)
				authRoutes.POST("/google/authorize", googleOAuthHandler.Authorize)
				authRoutes.POST("/google/callback", googleOAuthHandler.Callback)
			}

			// Subscription webhook (no JWT required)
			subscriptionRoutes := public.Group("/subscriptions")
			{
				subscriptionRoutes.POST("/webhook", subscriptionHandler.HandleWebhook)
			}
		}

		// Protected routes (require API key + JWT)
		protected := api.Group("")
		protected.Use(auth.APIKeyAuth())
		protected.Use(auth.JWTAuth())
		{
			// Auth routes
			authRoutes := protected.Group("/auth")
			{
				authRoutes.GET("/me", authHandler.GetMe)
			}

			// Subscription routes
			subscriptionRoutes := protected.Group("/subscriptions")
			{
				subscriptionRoutes.GET("/plans", subscriptionHandler.GetPlans)
				subscriptionRoutes.GET("/current", subscriptionHandler.GetCurrentSubscription)
				subscriptionRoutes.POST("/checkout", subscriptionHandler.CreateCheckout)
				subscriptionRoutes.POST("/portal", subscriptionHandler.CreatePortal)
			}

			// Storage routes
			storageRoutes := protected.Group("/storage")
			{
				storageRoutes.POST("/upload", storageHandler.Upload)
				storageRoutes.GET("/download", storageHandler.Download)
				storageRoutes.GET("/list", storageHandler.ListFiles)
				storageRoutes.GET("/signed-url", storageHandler.GetSignedURL)
				storageRoutes.DELETE("/files/*path", storageHandler.Delete)
			}

			// Google Drive routes
			driveRoutes := protected.Group("/drive")
			{
				driveRoutes.GET("/files", driveHandler.ListFiles)
				driveRoutes.GET("/files/:file_id", driveHandler.GetFile)
				driveRoutes.GET("/files/:file_id/download", driveHandler.DownloadFile)
				driveRoutes.GET("/files/:file_id/export", driveHandler.ExportFile)
				driveRoutes.GET("/search", driveHandler.SearchFiles)
			}

			// Organization routes
			orgRoutes := protected.Group("/organizations")
			{
				orgRoutes.GET("", orgHandler.List)
				orgRoutes.POST("", orgHandler.Create)
				orgRoutes.GET("/:org_id", orgHandler.Get)
				orgRoutes.PUT("/:org_id", orgHandler.Update)
				orgRoutes.DELETE("/:org_id", orgHandler.Delete)
				orgRoutes.GET("/:org_id/members", orgHandler.ListMembers)
				orgRoutes.DELETE("/:org_id/members/:member_id", orgHandler.RemoveMember)
				orgRoutes.PATCH("/:org_id/members/:member_id/role", orgHandler.UpdateMemberRole)
				orgRoutes.GET("/:org_id/invitations", orgHandler.ListInvitations)
				orgRoutes.POST("/:org_id/invitations", orgHandler.CreateInvitation)
				orgRoutes.POST("/:org_id/invitations/:inv_id/revoke", orgHandler.RevokeInvitation)
				orgRoutes.POST("/invitations/accept", orgHandler.AcceptInvitation)
			}

			// Email routes
			emailRoutes := protected.Group("/email")
			{
				emailRoutes.POST("/send", emailHandler.Send)
				emailRoutes.GET("/templates", emailHandler.ListTemplates)
				emailRoutes.GET("/templates/:name", emailHandler.GetTemplate)
				emailRoutes.POST("/templates", emailHandler.CreateTemplate)
				emailRoutes.PUT("/templates/:name", emailHandler.UpdateTemplate)
				emailRoutes.DELETE("/templates/:name", emailHandler.DeleteTemplate)
			}

			// Shenbi app routes
			shenbiRoutes := protected.Group("/shenbi")
			{
				// Profile
				profileRoutes := shenbiRoutes.Group("/profile")
				{
					profileRoutes.GET("", shenbiHandler.GetProfile)
					profileRoutes.POST("", shenbiHandler.CreateProfile)
					profileRoutes.PUT("", shenbiHandler.UpdateProfile)
				}

				// Progress
				progressRoutes := shenbiRoutes.Group("/progress")
				{
					progressRoutes.GET("", shenbiHandler.GetProgress)
					progressRoutes.GET("/:adventure/:level", shenbiHandler.GetLevelProgress)
					progressRoutes.POST("/:adventure/:level", shenbiHandler.UpdateProgress)
				}

				// Achievements
				achievementRoutes := shenbiRoutes.Group("/achievements")
				{
					achievementRoutes.GET("", shenbiHandler.GetAchievements)
					achievementRoutes.POST("/unlock", shenbiHandler.UnlockAchievement)
				}

				// Classrooms
				classroomRoutes := shenbiRoutes.Group("/classrooms")
				{
					classroomRoutes.GET("", shenbiHandler.GetClassrooms)
					classroomRoutes.POST("", shenbiHandler.CreateClassroom)
					classroomRoutes.GET("/:classroom_id", shenbiHandler.GetClassroom)
					classroomRoutes.PUT("/:classroom_id", shenbiHandler.UpdateClassroom)
					classroomRoutes.DELETE("/:classroom_id", shenbiHandler.DeleteClassroom)
					classroomRoutes.POST("/join", shenbiHandler.JoinClassroom)
					classroomRoutes.GET("/:classroom_id/members", shenbiHandler.GetClassroomMembers)
					classroomRoutes.GET("/:classroom_id/assignments", shenbiHandler.GetAssignments)
					classroomRoutes.POST("/:classroom_id/assignments", shenbiHandler.CreateAssignment)
					classroomRoutes.POST("/:classroom_id/assignments/:assignment_id/publish", shenbiHandler.PublishAssignment)
					classroomRoutes.POST("/:classroom_id/assignments/:assignment_id/submit", shenbiHandler.SubmitAssignment)
					classroomRoutes.GET("/:classroom_id/assignments/:assignment_id/submissions", shenbiHandler.GetSubmissions)
				}

				// Battles
				battleRoutes := shenbiRoutes.Group("/battles")
				{
					battleRoutes.POST("/create-room", shenbiHandler.CreateBattleRoom)
					battleRoutes.POST("/join-room", shenbiHandler.JoinBattleRoom)
					battleRoutes.GET("/room/:room_code", shenbiHandler.GetBattleRoom)
					battleRoutes.POST("/room/:room_code/start", shenbiHandler.StartBattle)
					battleRoutes.POST("/room/:room_code/complete", shenbiHandler.CompleteBattle)
				}

				// Live sessions
				liveRoutes := shenbiRoutes.Group("/live")
				{
					liveRoutes.POST("/session/create", shenbiHandler.CreateLiveSession)
					liveRoutes.GET("/session/:room_code", shenbiHandler.GetLiveSession)
					liveRoutes.POST("/session/:room_code/start", shenbiHandler.StartLiveSession)
					liveRoutes.POST("/session/:room_code/set-level", shenbiHandler.SetLiveSessionLevel)
					liveRoutes.POST("/session/:room_code/student-join", shenbiHandler.JoinLiveSession)
					liveRoutes.POST("/session/:room_code/student-complete", shenbiHandler.CompleteLiveSessionLevel)
					liveRoutes.POST("/session/:room_code/end", shenbiHandler.EndLiveSession)
				}

				// Sessions (classroom sessions)
				sessionRoutes := shenbiRoutes.Group("/sessions")
				{
					sessionRoutes.POST("/join", shenbiHandler.JoinSession)
					sessionRoutes.GET("/:session_id", shenbiHandler.GetSession)
					sessionRoutes.POST("/:session_id/leave", shenbiHandler.LeaveSession)
				}

				// Settings
				settingsRoutes := shenbiRoutes.Group("/settings")
				{
					settingsRoutes.GET("", shenbiHandler.GetSettings)
					settingsRoutes.PUT("", shenbiHandler.UpdateSettings)
				}
			}
		}
	}

	// =============================================================================
	// Admin Routes
	// =============================================================================

	admin := r.Group("/admin")
	{
		// Public admin routes (no auth required)
		admin.POST("/auth/google", adminHandler.GoogleAuth)
		admin.GET("/logout", adminHandler.Logout)

		// Protected admin API routes
		adminAPI := admin.Group("/api")
		adminAPI.Use(adminAuth.RequireAdmin())
		{
			adminAPI.GET("/me", adminHandler.GetMe)
			adminAPI.POST("/logout", adminHandler.Logout)
			adminAPI.GET("/apps", adminHandler.GetApps)
			adminAPI.GET("/apps/:app_id", adminHandler.GetApp)
			adminAPI.GET("/apps/:app_id/users", adminHandler.GetAppUsers)
			adminAPI.POST("/apps/:app_id/users/:user_id/shenbi-role", adminHandler.UpdateShenbiRole)
			adminAPI.POST("/apps/:app_id/users/:user_id/generate-token", adminHandler.GenerateToken)
			adminAPI.POST("/apps/:app_id/users/:user_id/reset-progress", adminHandler.ResetProgress)
			adminAPI.POST("/apps/:app_id/users/:user_id/send-email", adminHandler.SendEmail)
			adminAPI.POST("/apps/:app_id/users/:user_id/send-template-email", adminHandler.SendTemplateEmail)
			adminAPI.GET("/apps/:app_id/email-templates", adminHandler.GetEmailTemplates)
			adminAPI.GET("/apps/:app_id/email-templates/:template_id", adminHandler.GetEmailTemplate)
			adminAPI.GET("/apps/:app_id/plans", adminHandler.GetPlans)
			adminAPI.PUT("/apps/:app_id/plans/:plan_id", adminHandler.UpdatePlan)
			adminAPI.DELETE("/apps/:app_id/plans/:plan_id", adminHandler.DeletePlan)
			adminAPI.GET("/apps/:app_id/organizations", adminHandler.GetOrganizations)
		}

		// Protected admin form/action routes (without /api prefix)
		adminProtected := admin.Group("")
		adminProtected.Use(adminAuth.RequireAdmin())
		{
			adminProtected.POST("/apps/:app_id/email-templates", adminHandler.CreateEmailTemplate)
			adminProtected.PUT("/apps/:app_id/email-templates/:template_id", adminHandler.UpdateEmailTemplate)
			adminProtected.DELETE("/apps/:app_id/email-templates/:template_id", adminHandler.DeleteEmailTemplate)
			adminProtected.POST("/apps/:app_id/plans", adminHandler.CreatePlan)
			adminProtected.POST("/apps/:app_id/organizations", adminHandler.CreateOrganization)
			adminProtected.PUT("/apps/:app_id/organizations/:org_id", adminHandler.UpdateOrganization)
			adminProtected.POST("/apps/:app_id/organizations/:org_id/toggle-status", adminHandler.ToggleOrganizationStatus)
			adminProtected.DELETE("/apps/:app_id/organizations/:org_id", adminHandler.DeleteOrganization)
			adminProtected.GET("/apps/:app_id/storage/files", adminHandler.GetStorageFiles)
			adminProtected.POST("/apps/:app_id/storage/upload", adminHandler.UploadStorageFile)
			adminProtected.GET("/apps/:app_id/storage/signed-url", adminHandler.GetStorageSignedURL)
			adminProtected.DELETE("/apps/:app_id/storage/file", adminHandler.DeleteStorageFile)
		}
	}

	// Serve static files for shenbi (public app) and admin UI
	setupStaticFiles(r, cfg)

	return r
}

// setupStaticFiles configures static file serving for both shenbi and admin UI SPAs
func setupStaticFiles(r *gin.Engine, cfg *config.Config) {
	adminExists := true
	shenbiExists := true

	if _, err := os.Stat(adminDir); os.IsNotExist(err) {
		adminExists = false
	}
	if _, err := os.Stat(shenbiDir); os.IsNotExist(err) {
		shenbiExists = false
	}

	// Serve admin index at /admin (for direct access to admin panel root)
	if adminExists {
		r.GET("/admin", func(c *gin.Context) {
			c.File(filepath.Join(adminDir, "index.html"))
		})
	}

	// Serve shenbi index at /
	if shenbiExists {
		r.GET("/", func(c *gin.Context) {
			c.File(filepath.Join(shenbiDir, "index.html"))
		})
	}

	// Handle all other routes
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path

		// Admin API routes - these are handled by actual routes, so return 404 JSON
		// This means the route wasn't found by the router
		if strings.HasPrefix(path, "/admin/auth/") || strings.HasPrefix(path, "/admin/api/") || strings.HasPrefix(path, "/admin/apps/") {
			c.JSON(http.StatusNotFound, gin.H{"detail": "Not found"})
			return
		}

		// Handle /admin/* static file routes (for SPA)
		if strings.HasPrefix(path, "/admin") && adminExists {
			filePath := strings.TrimPrefix(path, "/admin")
			if filePath == "" || filePath == "/" {
				c.File(filepath.Join(adminDir, "index.html"))
				return
			}
			fullPath := filepath.Join(adminDir, filePath)

			// Check if file exists (for assets like /admin/assets/xxx.js)
			if _, err := os.Stat(fullPath); err == nil {
				c.File(fullPath)
				return
			}

			// SPA fallback - serve index.html for client-side routing
			c.File(filepath.Join(adminDir, "index.html"))
			return
		}

		// API routes return 404 JSON
		if strings.HasPrefix(path, "/api/") {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}

		// Handle shenbi routes (everything else)
		if shenbiExists {
			fullPath := filepath.Join(shenbiDir, path)

			// Check if file exists (for assets like /assets/xxx.js)
			if _, err := os.Stat(fullPath); err == nil {
				c.File(fullPath)
				return
			}

			// SPA fallback - serve index.html for client-side routing
			c.File(filepath.Join(shenbiDir, "index.html"))
			return
		}

		// Nothing available
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
	})
}
