package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"gigaboo.io/lem/internal/middleware"
	"gigaboo.io/lem/internal/services"
)

// ShenbiHandler handles all Shenbi endpoints.
type ShenbiHandler struct {
	shenbiService *services.ShenbiService
}

// NewShenbiHandler creates a new Shenbi handler.
func NewShenbiHandler(shenbiService *services.ShenbiService) *ShenbiHandler {
	return &ShenbiHandler{
		shenbiService: shenbiService,
	}
}

// ========== Profile ==========

// GetProfile returns user's profile.
func (h *ShenbiHandler) GetProfile(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	app := middleware.GetAppFromGin(c)
	if user == nil || app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	profile, err := h.shenbiService.GetProfile(c.Request.Context(), app.ID, user.ID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "profile not found"})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// CreateProfile creates a new profile.
func (h *ShenbiHandler) CreateProfile(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	app := middleware.GetAppFromGin(c)
	if user == nil || app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	var input services.ProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	profile, err := h.shenbiService.CreateProfile(c.Request.Context(), app.ID, user.ID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, profile)
}

// UpdateProfile updates a profile.
func (h *ShenbiHandler) UpdateProfile(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	app := middleware.GetAppFromGin(c)
	if user == nil || app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	var input services.ProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	profile, err := h.shenbiService.UpdateProfile(c.Request.Context(), app.ID, user.ID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// ========== Progress ==========

// GetProgress returns all progress.
func (h *ShenbiHandler) GetProgress(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	app := middleware.GetAppFromGin(c)
	if user == nil || app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	progress, err := h.shenbiService.GetProgress(c.Request.Context(), app.ID, user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"progress": progress})
}

// GetLevelProgress returns progress for a specific level.
func (h *ShenbiHandler) GetLevelProgress(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	app := middleware.GetAppFromGin(c)
	if user == nil || app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	adventure := c.Param("adventure")
	level := c.Param("level")

	progress, err := h.shenbiService.GetLevelProgress(c.Request.Context(), app.ID, user.ID, adventure, level)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "progress not found"})
		return
	}

	c.JSON(http.StatusOK, progress)
}

// UpdateProgress updates progress for a level.
func (h *ShenbiHandler) UpdateProgress(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	app := middleware.GetAppFromGin(c)
	if user == nil || app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	adventure := c.Param("adventure")
	level := c.Param("level")

	var input services.ProgressInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	progress, err := h.shenbiService.UpdateProgress(c.Request.Context(), app.ID, user.ID, adventure, level, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, progress)
}

// ========== Achievements ==========

// GetAchievements returns all achievements.
func (h *ShenbiHandler) GetAchievements(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	app := middleware.GetAppFromGin(c)
	if user == nil || app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	achievements, err := h.shenbiService.GetAchievements(c.Request.Context(), app.ID, user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"achievements": achievements})
}

// UnlockAchievement unlocks an achievement.
func (h *ShenbiHandler) UnlockAchievement(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	app := middleware.GetAppFromGin(c)
	if user == nil || app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	var input struct {
		AchievementID string `json:"achievement_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	achievement, err := h.shenbiService.UnlockAchievement(c.Request.Context(), app.ID, user.ID, input.AchievementID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, achievement)
}

// ========== Classrooms ==========

// GetClassrooms returns all classrooms.
func (h *ShenbiHandler) GetClassrooms(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	app := middleware.GetAppFromGin(c)
	if user == nil || app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	// Check role query param
	isTeacher := c.Query("role") == "teacher"

	classrooms, err := h.shenbiService.GetClassrooms(c.Request.Context(), app.ID, user.ID, isTeacher)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"classrooms": classrooms})
}

// GetClassroom returns a single classroom.
func (h *ShenbiHandler) GetClassroom(c *gin.Context) {
	classroomID, err := strconv.Atoi(c.Param("classroom_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid classroom id"})
		return
	}

	classroom, err := h.shenbiService.GetClassroom(c.Request.Context(), classroomID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "classroom not found"})
		return
	}

	c.JSON(http.StatusOK, classroom)
}

// CreateClassroom creates a new classroom.
func (h *ShenbiHandler) CreateClassroom(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	app := middleware.GetAppFromGin(c)
	if user == nil || app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	var input services.ClassroomInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	classroom, err := h.shenbiService.CreateClassroom(c.Request.Context(), app.ID, user.ID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, classroom)
}

// UpdateClassroom updates a classroom.
func (h *ShenbiHandler) UpdateClassroom(c *gin.Context) {
	classroomID, err := strconv.Atoi(c.Param("classroom_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid classroom id"})
		return
	}

	var input services.ClassroomInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	classroom, err := h.shenbiService.UpdateClassroom(c.Request.Context(), classroomID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, classroom)
}

// DeleteClassroom deletes a classroom.
func (h *ShenbiHandler) DeleteClassroom(c *gin.Context) {
	classroomID, err := strconv.Atoi(c.Param("classroom_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid classroom id"})
		return
	}

	if err := h.shenbiService.DeleteClassroom(c.Request.Context(), classroomID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// JoinClassroom joins a classroom.
func (h *ShenbiHandler) JoinClassroom(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	var input struct {
		JoinCode string `json:"join_code" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	classroom, err := h.shenbiService.JoinClassroom(c.Request.Context(), user.ID, input.JoinCode)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, classroom)
}

// GetClassroomMembers returns classroom members.
func (h *ShenbiHandler) GetClassroomMembers(c *gin.Context) {
	classroomID, err := strconv.Atoi(c.Param("classroom_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid classroom id"})
		return
	}

	members, err := h.shenbiService.GetClassroomMembers(c.Request.Context(), classroomID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"members": members})
}

// ========== Assignments ==========

// GetAssignments returns all assignments.
func (h *ShenbiHandler) GetAssignments(c *gin.Context) {
	classroomID, err := strconv.Atoi(c.Param("classroom_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid classroom id"})
		return
	}

	assignments, err := h.shenbiService.GetAssignments(c.Request.Context(), classroomID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"assignments": assignments})
}

// CreateAssignment creates an assignment.
func (h *ShenbiHandler) CreateAssignment(c *gin.Context) {
	classroomID, err := strconv.Atoi(c.Param("classroom_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid classroom id"})
		return
	}

	var input services.AssignmentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	assignment, err := h.shenbiService.CreateAssignment(c.Request.Context(), classroomID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, assignment)
}

// PublishAssignment publishes an assignment.
func (h *ShenbiHandler) PublishAssignment(c *gin.Context) {
	assignmentID, err := strconv.Atoi(c.Param("assignment_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid assignment id"})
		return
	}

	assignment, err := h.shenbiService.PublishAssignment(c.Request.Context(), assignmentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, assignment)
}

// SubmitAssignment submits an assignment.
func (h *ShenbiHandler) SubmitAssignment(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	assignmentID, err := strconv.Atoi(c.Param("assignment_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid assignment id"})
		return
	}

	var input services.SubmissionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	submission, err := h.shenbiService.SubmitAssignment(c.Request.Context(), assignmentID, user.ID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, submission)
}

// GetSubmissions returns all submissions.
func (h *ShenbiHandler) GetSubmissions(c *gin.Context) {
	assignmentID, err := strconv.Atoi(c.Param("assignment_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid assignment id"})
		return
	}

	submissions, err := h.shenbiService.GetSubmissions(c.Request.Context(), assignmentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"submissions": submissions})
}

// ========== Battles ==========

// CreateBattleRoom creates a battle room.
func (h *ShenbiHandler) CreateBattleRoom(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	app := middleware.GetAppFromGin(c)
	if user == nil || app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	var input struct {
		HostName string                 `json:"host_name"`
		Level    map[string]interface{} `json:"level"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	room, err := h.shenbiService.CreateBattleRoom(c.Request.Context(), app.ID, user.ID, input.HostName, services.BattleInput{Level: input.Level})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, room)
}

// JoinBattleRoom joins a battle room.
func (h *ShenbiHandler) JoinBattleRoom(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	var input struct {
		RoomCode  string `json:"room_code" binding:"required"`
		GuestName string `json:"guest_name"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	room, err := h.shenbiService.JoinBattleRoom(c.Request.Context(), input.RoomCode, user.ID, input.GuestName)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, room)
}

// GetBattleRoom returns a battle room.
func (h *ShenbiHandler) GetBattleRoom(c *gin.Context) {
	roomCode := c.Param("room_code")

	room, err := h.shenbiService.GetBattleRoom(c.Request.Context(), roomCode)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "room not found"})
		return
	}

	c.JSON(http.StatusOK, room)
}

// StartBattle starts a battle.
func (h *ShenbiHandler) StartBattle(c *gin.Context) {
	roomCode := c.Param("room_code")

	room, err := h.shenbiService.StartBattle(c.Request.Context(), roomCode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, room)
}

// CompleteBattle completes a battle.
func (h *ShenbiHandler) CompleteBattle(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	roomCode := c.Param("room_code")

	var input struct {
		Code string `json:"code"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	room, err := h.shenbiService.CompleteBattle(c.Request.Context(), roomCode, user.ID, input.Code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, room)
}

// ========== Live Sessions ==========

// CreateLiveSession creates a live session.
func (h *ShenbiHandler) CreateLiveSession(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	app := middleware.GetAppFromGin(c)
	if user == nil || app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	var input struct {
		ClassroomID int `json:"classroom_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	session, err := h.shenbiService.CreateLiveSession(c.Request.Context(), app.ID, input.ClassroomID, user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, session)
}

// GetLiveSession returns a live session.
func (h *ShenbiHandler) GetLiveSession(c *gin.Context) {
	roomCode := c.Param("room_code")

	session, err := h.shenbiService.GetLiveSession(c.Request.Context(), roomCode)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "session not found"})
		return
	}

	c.JSON(http.StatusOK, session)
}

// StartLiveSession starts a live session.
func (h *ShenbiHandler) StartLiveSession(c *gin.Context) {
	roomCode := c.Param("room_code")

	session, err := h.shenbiService.StartLiveSession(c.Request.Context(), roomCode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, session)
}

// SetLiveSessionLevel sets the level.
func (h *ShenbiHandler) SetLiveSessionLevel(c *gin.Context) {
	roomCode := c.Param("room_code")

	var input struct {
		Level map[string]interface{} `json:"level" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	session, err := h.shenbiService.SetLiveSessionLevel(c.Request.Context(), roomCode, input.Level)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, session)
}

// JoinLiveSession joins a live session.
func (h *ShenbiHandler) JoinLiveSession(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	roomCode := c.Param("room_code")

	var input struct {
		StudentName string `json:"student_name"`
	}
	c.ShouldBindJSON(&input)

	student, err := h.shenbiService.JoinLiveSession(c.Request.Context(), roomCode, user.ID, input.StudentName)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, student)
}

// CompleteLiveSessionLevel completes a level in live session.
func (h *ShenbiHandler) CompleteLiveSessionLevel(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	roomCode := c.Param("room_code")

	var input struct {
		Stars int    `json:"stars"`
		Code  string `json:"code"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	student, err := h.shenbiService.CompleteLiveSessionLevel(c.Request.Context(), roomCode, user.ID, input.Stars, input.Code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, student)
}

// EndLiveSession ends a live session.
func (h *ShenbiHandler) EndLiveSession(c *gin.Context) {
	roomCode := c.Param("room_code")

	session, err := h.shenbiService.EndLiveSession(c.Request.Context(), roomCode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, session)
}

// ========== Sessions ==========

// JoinSession joins a classroom session.
func (h *ShenbiHandler) JoinSession(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	app := middleware.GetAppFromGin(c)
	if user == nil || app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	var input struct {
		ClassroomID int    `json:"classroom_id" binding:"required"`
		RoomCode    string `json:"room_code" binding:"required"`
		Role        string `json:"role" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	session, err := h.shenbiService.JoinClassroomSession(c.Request.Context(), app.ID, user.ID, input.ClassroomID, input.RoomCode, input.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, session)
}

// GetSession returns a session.
func (h *ShenbiHandler) GetSession(c *gin.Context) {
	sessionID, err := strconv.Atoi(c.Param("session_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid session id"})
		return
	}

	session, err := h.shenbiService.GetClassroomSession(c.Request.Context(), sessionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "session not found"})
		return
	}

	c.JSON(http.StatusOK, session)
}

// LeaveSession leaves a session.
func (h *ShenbiHandler) LeaveSession(c *gin.Context) {
	sessionID, err := strconv.Atoi(c.Param("session_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid session id"})
		return
	}

	if err := h.shenbiService.LeaveClassroomSession(c.Request.Context(), sessionID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"left": true})
}

// ========== Settings ==========

// GetSettings returns user settings.
func (h *ShenbiHandler) GetSettings(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	app := middleware.GetAppFromGin(c)
	if user == nil || app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	settings, err := h.shenbiService.GetSettings(c.Request.Context(), app.ID, user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, settings)
}

// UpdateSettings updates user settings.
func (h *ShenbiHandler) UpdateSettings(c *gin.Context) {
	user := middleware.GetUserFromGin(c)
	app := middleware.GetAppFromGin(c)
	if user == nil || app == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	var input services.SettingsInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	settings, err := h.shenbiService.UpdateSettings(c.Request.Context(), app.ID, user.ID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, settings)
}
