package services

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"gigaboo.io/lem/internal/config"
	"gigaboo.io/lem/internal/ent"
	"gigaboo.io/lem/internal/ent/achievement"
	"gigaboo.io/lem/internal/ent/app"
	"gigaboo.io/lem/internal/ent/assignment"
	"gigaboo.io/lem/internal/ent/assignmentsubmission"
	"gigaboo.io/lem/internal/ent/battleroom"
	"gigaboo.io/lem/internal/ent/classroom"
	"gigaboo.io/lem/internal/ent/classroommembership"
	"gigaboo.io/lem/internal/ent/classroomsession"
	"gigaboo.io/lem/internal/ent/livesession"
	"gigaboo.io/lem/internal/ent/livesessionstudent"
	"gigaboo.io/lem/internal/ent/shenbiprofile"
	"gigaboo.io/lem/internal/ent/shenbisettings"
	"gigaboo.io/lem/internal/ent/user"
	"gigaboo.io/lem/internal/ent/userprogress"
)

// ShenbiService handles all Shenbi-related operations.
type ShenbiService struct {
	cfg    *config.Config
	client *ent.Client
}

// NewShenbiService creates a new Shenbi service.
func NewShenbiService(cfg *config.Config, client *ent.Client) *ShenbiService {
	return &ShenbiService{
		cfg:    cfg,
		client: client,
	}
}

// ========== Profile ==========

// ProfileInput represents profile creation/update input.
type ProfileInput struct {
	Role        string `json:"role"`
	DisplayName string `json:"display_name"`
	AvatarURL   string `json:"avatar_url"`
	Grade       int    `json:"grade"`
	Age         int    `json:"age"`
}

// GetProfile returns user's Shenbi profile.
func (s *ShenbiService) GetProfile(ctx context.Context, appID, userID int) (*ent.ShenbiProfile, error) {
	return s.client.ShenbiProfile.Query().
		Where(
			shenbiprofile.HasAppWith(app.ID(appID)),
			shenbiprofile.HasUserWith(user.ID(userID)),
		).
		First(ctx)
}

// GetOrCreateProfile returns user's profile, creating one with defaults if it doesn't exist.
func (s *ShenbiService) GetOrCreateProfile(ctx context.Context, appID, userID int, userName string) (*ent.ShenbiProfile, error) {
	profile, err := s.GetProfile(ctx, appID, userID)
	if err == nil {
		return profile, nil
	}

	// Create default profile
	displayName := userName
	if displayName == "" {
		displayName = "Student"
	}

	return s.client.ShenbiProfile.Create().
		SetAppID(appID).
		SetUserID(userID).
		SetRole(shenbiprofile.RoleSTUDENT).
		SetDisplayName(displayName).
		Save(ctx)
}

// CreateProfile creates a new profile.
func (s *ShenbiService) CreateProfile(ctx context.Context, appID, userID int, input ProfileInput) (*ent.ShenbiProfile, error) {
	return s.client.ShenbiProfile.Create().
		SetAppID(appID).
		SetUserID(userID).
		SetRole(shenbiprofile.Role(input.Role)).
		SetDisplayName(input.DisplayName).
		SetAvatarURL(input.AvatarURL).
		SetGrade(input.Grade).
		SetAge(input.Age).
		Save(ctx)
}

// UpdateProfile updates a profile.
func (s *ShenbiService) UpdateProfile(ctx context.Context, appID, userID int, input ProfileInput) (*ent.ShenbiProfile, error) {
	profile, err := s.GetProfile(ctx, appID, userID)
	if err != nil {
		return nil, err
	}

	update := s.client.ShenbiProfile.UpdateOne(profile)
	if input.DisplayName != "" {
		update.SetDisplayName(input.DisplayName)
	}
	if input.AvatarURL != "" {
		update.SetAvatarURL(input.AvatarURL)
	}
	if input.Grade > 0 {
		update.SetGrade(input.Grade)
	}
	if input.Age > 0 {
		update.SetAge(input.Age)
	}
	return update.Save(ctx)
}

// ========== Progress ==========

// ProgressInput represents progress update input.
type ProgressInput struct {
	Stars     int    `json:"stars"`
	Completed bool   `json:"completed"`
	Attempts  int    `json:"attempts"`
	BestCode  string `json:"best_code"`
}

// GetProgress returns all progress for a user.
func (s *ShenbiService) GetProgress(ctx context.Context, appID, userID int) ([]*ent.UserProgress, error) {
	return s.client.UserProgress.Query().
		Where(
			userprogress.HasAppWith(app.ID(appID)),
			userprogress.HasUserWith(user.ID(userID)),
		).
		All(ctx)
}

// GetLevelProgress returns progress for a specific level.
func (s *ShenbiService) GetLevelProgress(ctx context.Context, appID, userID int, adventureSlug, levelSlug string) (*ent.UserProgress, error) {
	return s.client.UserProgress.Query().
		Where(
			userprogress.HasAppWith(app.ID(appID)),
			userprogress.HasUserWith(user.ID(userID)),
			userprogress.AdventureSlug(adventureSlug),
			userprogress.LevelSlug(levelSlug),
		).
		First(ctx)
}

// UpdateProgress updates or creates progress for a level.
func (s *ShenbiService) UpdateProgress(ctx context.Context, appID, userID int, adventureSlug, levelSlug string, input ProgressInput) (*ent.UserProgress, error) {
	// Try to get existing progress
	existing, err := s.GetLevelProgress(ctx, appID, userID, adventureSlug, levelSlug)
	if err != nil {
		// Create new
		create := s.client.UserProgress.Create().
			SetAppID(appID).
			SetUserID(userID).
			SetAdventureSlug(adventureSlug).
			SetLevelSlug(levelSlug).
			SetStars(input.Stars).
			SetCompleted(input.Completed).
			SetAttempts(input.Attempts).
			SetBestCode(input.BestCode).
			SetLastAttemptAt(time.Now())

		if input.Completed {
			create.SetFirstCompletedAt(time.Now())
		}
		return create.Save(ctx)
	}

	// Update existing
	update := s.client.UserProgress.UpdateOne(existing).
		SetAttempts(existing.Attempts + 1).
		SetLastAttemptAt(time.Now())

	if input.Stars > existing.Stars {
		update.SetStars(input.Stars)
	}
	if input.Completed && !existing.Completed {
		update.SetCompleted(true).SetFirstCompletedAt(time.Now())
	}
	if input.BestCode != "" {
		update.SetBestCode(input.BestCode)
	}

	return update.Save(ctx)
}

// ========== Achievements ==========

// GetAchievements returns all achievements for a user.
func (s *ShenbiService) GetAchievements(ctx context.Context, appID, userID int) ([]*ent.Achievement, error) {
	return s.client.Achievement.Query().
		Where(
			achievement.HasAppWith(app.ID(appID)),
			achievement.HasUserWith(user.ID(userID)),
		).
		All(ctx)
}

// UnlockAchievement unlocks an achievement.
func (s *ShenbiService) UnlockAchievement(ctx context.Context, appID, userID int, achievementID string) (*ent.Achievement, error) {
	// Check if already unlocked
	existing, _ := s.client.Achievement.Query().
		Where(
			achievement.HasAppWith(app.ID(appID)),
			achievement.HasUserWith(user.ID(userID)),
			achievement.AchievementID(achievementID),
		).
		First(ctx)

	if existing != nil {
		return existing, nil
	}

	return s.client.Achievement.Create().
		SetAppID(appID).
		SetUserID(userID).
		SetAchievementID(achievementID).
		SetEarnedAt(time.Now()).
		Save(ctx)
}

// ========== Classrooms ==========

// ClassroomInput represents classroom creation input.
type ClassroomInput struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

// GetClassrooms returns classrooms for a teacher or student.
func (s *ShenbiService) GetClassrooms(ctx context.Context, appID, userID int, isTeacher bool) ([]*ent.Classroom, error) {
	if isTeacher {
		return s.client.Classroom.Query().
			Where(
				classroom.HasAppWith(app.ID(appID)),
				classroom.HasTeacherWith(user.ID(userID)),
			).
			WithMemberships(func(q *ent.ClassroomMembershipQuery) {
				q.WithStudent()
			}).
			All(ctx)
	}

	// Student - get via memberships
	memberships, err := s.client.ClassroomMembership.Query().
		Where(
			classroommembership.HasStudentWith(user.ID(userID)),
			classroommembership.StatusEQ(classroommembership.StatusACTIVE),
		).
		WithClassroom().
		All(ctx)
	if err != nil {
		return nil, err
	}

	classrooms := make([]*ent.Classroom, 0, len(memberships))
	for _, m := range memberships {
		if m.Edges.Classroom != nil {
			classrooms = append(classrooms, m.Edges.Classroom)
		}
	}
	return classrooms, nil
}

// GetClassroom returns a single classroom.
func (s *ShenbiService) GetClassroom(ctx context.Context, classroomID int) (*ent.Classroom, error) {
	return s.client.Classroom.Query().
		Where(classroom.ID(classroomID)).
		WithTeacher().
		WithMemberships(func(q *ent.ClassroomMembershipQuery) {
			q.WithStudent()
		}).
		First(ctx)
}

// CreateClassroom creates a new classroom.
func (s *ShenbiService) CreateClassroom(ctx context.Context, appID, teacherID int, input ClassroomInput) (*ent.Classroom, error) {
	joinCode, err := generateShenbiCode()
	if err != nil {
		return nil, err
	}

	return s.client.Classroom.Create().
		SetAppID(appID).
		SetTeacherID(teacherID).
		SetName(input.Name).
		SetDescription(input.Description).
		SetJoinCode(joinCode).
		SetIsActive(true).
		SetAllowJoin(true).
		Save(ctx)
}

// UpdateClassroom updates a classroom.
func (s *ShenbiService) UpdateClassroom(ctx context.Context, classroomID int, input ClassroomInput) (*ent.Classroom, error) {
	return s.client.Classroom.UpdateOneID(classroomID).
		SetName(input.Name).
		SetDescription(input.Description).
		Save(ctx)
}

// DeleteClassroom deletes a classroom.
func (s *ShenbiService) DeleteClassroom(ctx context.Context, classroomID int) error {
	return s.client.Classroom.DeleteOneID(classroomID).Exec(ctx)
}

// JoinClassroom joins a student to a classroom.
func (s *ShenbiService) JoinClassroom(ctx context.Context, studentID int, joinCode string) (*ent.Classroom, error) {
	cr, err := s.client.Classroom.Query().
		Where(
			classroom.JoinCode(joinCode),
			classroom.IsActive(true),
			classroom.AllowJoin(true),
		).
		First(ctx)
	if err != nil {
		return nil, errors.New("invalid join code")
	}

	// Check if already a member
	existing, _ := s.client.ClassroomMembership.Query().
		Where(
			classroommembership.HasClassroomWith(classroom.ID(cr.ID)),
			classroommembership.HasStudentWith(user.ID(studentID)),
		).
		First(ctx)

	if existing != nil {
		return cr, nil
	}

	_, err = s.client.ClassroomMembership.Create().
		SetClassroomID(cr.ID).
		SetStudentID(studentID).
		SetStatus(classroommembership.StatusACTIVE).
		Save(ctx)
	if err != nil {
		return nil, err
	}

	return cr, nil
}

// GetClassroomMembers returns all members of a classroom.
func (s *ShenbiService) GetClassroomMembers(ctx context.Context, classroomID int) ([]*ent.ClassroomMembership, error) {
	return s.client.ClassroomMembership.Query().
		Where(classroommembership.HasClassroomWith(classroom.ID(classroomID))).
		WithStudent().
		All(ctx)
}

// ========== Assignments ==========

// AssignmentInput represents assignment creation input.
type AssignmentInput struct {
	Title       string     `json:"title" binding:"required"`
	Description string     `json:"description"`
	LevelIDs    []string   `json:"level_ids"`
	MaxPoints   int        `json:"max_points"`
	DueDate     *time.Time `json:"due_date"`
}

// GetAssignments returns all assignments for a classroom.
func (s *ShenbiService) GetAssignments(ctx context.Context, classroomID int) ([]*ent.Assignment, error) {
	return s.client.Assignment.Query().
		Where(assignment.HasClassroomWith(classroom.ID(classroomID))).
		All(ctx)
}

// CreateAssignment creates a new assignment.
func (s *ShenbiService) CreateAssignment(ctx context.Context, classroomID int, input AssignmentInput) (*ent.Assignment, error) {
	create := s.client.Assignment.Create().
		SetClassroomID(classroomID).
		SetTitle(input.Title).
		SetDescription(input.Description).
		SetLevelIds(input.LevelIDs).
		SetMaxPoints(input.MaxPoints).
		SetStatus(assignment.StatusDRAFT)

	if input.DueDate != nil {
		create.SetDueDate(*input.DueDate)
	}

	return create.Save(ctx)
}

// PublishAssignment publishes an assignment.
func (s *ShenbiService) PublishAssignment(ctx context.Context, assignmentID int) (*ent.Assignment, error) {
	return s.client.Assignment.UpdateOneID(assignmentID).
		SetStatus(assignment.StatusPUBLISHED).
		Save(ctx)
}

// SubmissionInput represents assignment submission input.
type SubmissionInput struct {
	LevelsCompleted int `json:"levels_completed"`
	TotalLevels     int `json:"total_levels"`
	TotalStars      int `json:"total_stars"`
}

// SubmitAssignment submits an assignment.
func (s *ShenbiService) SubmitAssignment(ctx context.Context, assignmentID, studentID int, input SubmissionInput) (*ent.AssignmentSubmission, error) {
	gradePercentage := float64(0)
	if input.TotalLevels > 0 {
		gradePercentage = float64(input.LevelsCompleted) / float64(input.TotalLevels) * 100
	}

	return s.client.AssignmentSubmission.Create().
		SetAssignmentID(assignmentID).
		SetStudentID(studentID).
		SetLevelsCompleted(input.LevelsCompleted).
		SetTotalLevels(input.TotalLevels).
		SetTotalStars(input.TotalStars).
		SetGradePercentage(gradePercentage).
		SetSubmittedAt(time.Now()).
		Save(ctx)
}

// GetSubmissions returns all submissions for an assignment.
func (s *ShenbiService) GetSubmissions(ctx context.Context, assignmentID int) ([]*ent.AssignmentSubmission, error) {
	return s.client.AssignmentSubmission.Query().
		Where(assignmentsubmission.HasAssignmentWith(assignment.ID(assignmentID))).
		WithStudent().
		All(ctx)
}

// ========== Battles ==========

// BattleInput represents battle room creation input.
type BattleInput struct {
	Level map[string]interface{} `json:"level"`
}

// CreateBattleRoom creates a new battle room.
func (s *ShenbiService) CreateBattleRoom(ctx context.Context, appID, hostID int, hostName string, input BattleInput) (*ent.BattleRoom, error) {
	roomCode, err := generateShenbiCode()
	if err != nil {
		return nil, err
	}

	return s.client.BattleRoom.Create().
		SetAppID(appID).
		SetHostID(hostID).
		SetHostName(hostName).
		SetRoomCode(roomCode).
		SetLevel(input.Level).
		SetStatus(battleroom.StatusWAITING).
		SetExpiresAt(time.Now().Add(time.Hour)).
		Save(ctx)
}

// JoinBattleRoom joins a battle room.
func (s *ShenbiService) JoinBattleRoom(ctx context.Context, roomCode string, guestID int, guestName string) (*ent.BattleRoom, error) {
	room, err := s.client.BattleRoom.Query().
		Where(
			battleroom.RoomCode(roomCode),
			battleroom.StatusEQ(battleroom.StatusWAITING),
		).
		First(ctx)
	if err != nil {
		return nil, errors.New("room not found or not available")
	}

	return s.client.BattleRoom.UpdateOne(room).
		SetGuestID(guestID).
		SetGuestName(guestName).
		SetStatus(battleroom.StatusREADY).
		Save(ctx)
}

// GetBattleRoom returns a battle room by code.
func (s *ShenbiService) GetBattleRoom(ctx context.Context, roomCode string) (*ent.BattleRoom, error) {
	return s.client.BattleRoom.Query().
		Where(battleroom.RoomCode(roomCode)).
		WithHost().
		First(ctx)
}

// StartBattle starts a battle.
func (s *ShenbiService) StartBattle(ctx context.Context, roomCode string) (*ent.BattleRoom, error) {
	room, err := s.GetBattleRoom(ctx, roomCode)
	if err != nil {
		return nil, err
	}

	return s.client.BattleRoom.UpdateOne(room).
		SetStatus(battleroom.StatusPLAYING).
		SetStartedAt(time.Now()).
		Save(ctx)
}

// CompleteBattle marks a player as completed.
func (s *ShenbiService) CompleteBattle(ctx context.Context, roomCode string, userID int, code string) (*ent.BattleRoom, error) {
	room, err := s.GetBattleRoom(ctx, roomCode)
	if err != nil {
		return nil, err
	}

	update := s.client.BattleRoom.UpdateOne(room)
	now := time.Now()

	hostID := 0
	if room.Edges.Host != nil {
		hostID = room.Edges.Host.ID
	}

	if hostID == userID {
		update.SetHostCompleted(true).SetHostCompletedAt(now).SetHostCode(code)
	} else if room.GuestID != nil && *room.GuestID == userID {
		update.SetGuestCompleted(true).SetGuestCompletedAt(now).SetGuestCode(code)
	}

	// Check if both completed
	room, err = update.Save(ctx)
	if err != nil {
		return nil, err
	}

	if room.HostCompleted && room.GuestCompleted {
		// Determine winner
		var winnerID int
		if room.HostCompletedAt != nil && room.GuestCompletedAt != nil {
			if room.HostCompletedAt.Before(*room.GuestCompletedAt) {
				winnerID = hostID
			} else {
				winnerID = *room.GuestID
			}
		}
		return s.client.BattleRoom.UpdateOne(room).
			SetStatus(battleroom.StatusFINISHED).
			SetWinnerID(winnerID).
			Save(ctx)
	}

	return room, nil
}

// ========== Live Sessions ==========

// LiveSessionInput represents live session creation input.
type LiveSessionInput struct {
	Level map[string]interface{} `json:"level"`
}

// CreateLiveSession creates a new live session.
func (s *ShenbiService) CreateLiveSession(ctx context.Context, appID, classroomID, teacherID int) (*ent.LiveSession, error) {
	roomCode, err := generateShenbiCode()
	if err != nil {
		return nil, err
	}

	return s.client.LiveSession.Create().
		SetAppID(appID).
		SetClassroomID(classroomID).
		SetTeacherID(teacherID).
		SetRoomCode(roomCode).
		SetStatus(livesession.StatusWAITING).
		SetExpiresAt(time.Now().Add(2 * time.Hour)).
		Save(ctx)
}

// GetLiveSession returns a live session by room code.
func (s *ShenbiService) GetLiveSession(ctx context.Context, roomCode string) (*ent.LiveSession, error) {
	return s.client.LiveSession.Query().
		Where(livesession.RoomCode(roomCode)).
		WithClassroom().
		WithTeacher().
		WithStudents().
		First(ctx)
}

// StartLiveSession starts a live session.
func (s *ShenbiService) StartLiveSession(ctx context.Context, roomCode string) (*ent.LiveSession, error) {
	session, err := s.GetLiveSession(ctx, roomCode)
	if err != nil {
		return nil, err
	}

	return s.client.LiveSession.UpdateOne(session).
		SetStatus(livesession.StatusREADY).
		SetStartedAt(time.Now()).
		Save(ctx)
}

// SetLiveSessionLevel sets the level for a live session.
func (s *ShenbiService) SetLiveSessionLevel(ctx context.Context, roomCode string, level map[string]interface{}) (*ent.LiveSession, error) {
	session, err := s.GetLiveSession(ctx, roomCode)
	if err != nil {
		return nil, err
	}

	return s.client.LiveSession.UpdateOne(session).
		SetLevel(level).
		SetStatus(livesession.StatusPLAYING).
		Save(ctx)
}

// JoinLiveSession joins a student to a live session.
func (s *ShenbiService) JoinLiveSession(ctx context.Context, roomCode string, studentID int, studentName string) (*ent.LiveSessionStudent, error) {
	session, err := s.GetLiveSession(ctx, roomCode)
	if err != nil {
		return nil, errors.New("session not found")
	}

	// Check if already joined
	existing, _ := s.client.LiveSessionStudent.Query().
		Where(
			livesessionstudent.HasSessionWith(livesession.ID(session.ID)),
			livesessionstudent.HasStudentWith(user.ID(studentID)),
		).
		First(ctx)

	if existing != nil {
		return existing, nil
	}

	return s.client.LiveSessionStudent.Create().
		SetSessionID(session.ID).
		SetStudentID(studentID).
		SetStudentName(studentName).
		SetJoinedAt(time.Now()).
		Save(ctx)
}

// CompleteLiveSessionLevel marks a student as completed.
func (s *ShenbiService) CompleteLiveSessionLevel(ctx context.Context, roomCode string, studentID int, stars int, code string) (*ent.LiveSessionStudent, error) {
	session, err := s.GetLiveSession(ctx, roomCode)
	if err != nil {
		return nil, err
	}

	student, err := s.client.LiveSessionStudent.Query().
		Where(
			livesessionstudent.HasSessionWith(livesession.ID(session.ID)),
			livesessionstudent.HasStudentWith(user.ID(studentID)),
		).
		First(ctx)
	if err != nil {
		return nil, err
	}

	return s.client.LiveSessionStudent.UpdateOne(student).
		SetCompleted(true).
		SetCompletedAt(time.Now()).
		SetStarsCollected(stars).
		SetCode(code).
		Save(ctx)
}

// EndLiveSession ends a live session.
func (s *ShenbiService) EndLiveSession(ctx context.Context, roomCode string) (*ent.LiveSession, error) {
	session, err := s.GetLiveSession(ctx, roomCode)
	if err != nil {
		return nil, err
	}

	return s.client.LiveSession.UpdateOne(session).
		SetStatus(livesession.StatusENDED).
		SetEndedAt(time.Now()).
		Save(ctx)
}

// ========== Classroom Sessions ==========

// JoinClassroomSession joins a user to a classroom session.
func (s *ShenbiService) JoinClassroomSession(ctx context.Context, appID, userID, classroomID int, roomCode, role string) (*ent.ClassroomSession, error) {
	return s.client.ClassroomSession.Create().
		SetAppID(appID).
		SetUserID(userID).
		SetClassroomID(classroomID).
		SetRoomCode(roomCode).
		SetRole(classroomsession.Role(role)).
		SetStatus(classroomsession.StatusACTIVE).
		SetExpiresAt(time.Now().Add(2 * time.Hour)).
		Save(ctx)
}

// GetClassroomSession returns a classroom session.
func (s *ShenbiService) GetClassroomSession(ctx context.Context, sessionID int) (*ent.ClassroomSession, error) {
	return s.client.ClassroomSession.Get(ctx, sessionID)
}

// LeaveClassroomSession leaves a classroom session.
func (s *ShenbiService) LeaveClassroomSession(ctx context.Context, sessionID int) error {
	_, err := s.client.ClassroomSession.UpdateOneID(sessionID).
		SetStatus(classroomsession.StatusENDED).
		Save(ctx)
	return err
}

// ========== Settings ==========

// SettingsInput represents settings update input.
type SettingsInput struct {
	SoundEnabled   *bool           `json:"sound_enabled"`
	PreferredTheme *string         `json:"preferred_theme"`
	TourCompleted  map[string]bool `json:"tour_completed"`
}

// GetSettings returns user settings.
func (s *ShenbiService) GetSettings(ctx context.Context, appID, userID int) (*ent.ShenbiSettings, error) {
	settings, err := s.client.ShenbiSettings.Query().
		Where(
			shenbisettings.HasAppWith(app.ID(appID)),
			shenbisettings.HasUserWith(user.ID(userID)),
		).
		First(ctx)

	if err != nil {
		// Create default settings
		return s.client.ShenbiSettings.Create().
			SetAppID(appID).
			SetUserID(userID).
			SetSoundEnabled(true).
			SetPreferredTheme("light").
			Save(ctx)
	}

	return settings, nil
}

// UpdateSettings updates user settings.
func (s *ShenbiService) UpdateSettings(ctx context.Context, appID, userID int, input SettingsInput) (*ent.ShenbiSettings, error) {
	settings, err := s.GetSettings(ctx, appID, userID)
	if err != nil {
		return nil, err
	}

	update := s.client.ShenbiSettings.UpdateOne(settings)
	if input.SoundEnabled != nil {
		update.SetSoundEnabled(*input.SoundEnabled)
	}
	if input.PreferredTheme != nil {
		update.SetPreferredTheme(*input.PreferredTheme)
	}
	if input.TourCompleted != nil {
		update.SetTourCompleted(input.TourCompleted)
	}

	return update.Save(ctx)
}

// ========== Helpers ==========

func generateShenbiCode() (string, error) {
	bytes := make([]byte, 3)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	code := hex.EncodeToString(bytes)
	// Convert to uppercase
	result := make([]byte, len(code))
	for i := 0; i < len(code); i++ {
		c := code[i]
		if c >= 'a' && c <= 'z' {
			result[i] = c - 32
		} else {
			result[i] = c
		}
	}
	return string(result), nil
}
