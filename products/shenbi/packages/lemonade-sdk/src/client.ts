/**
 * Lemonade SDK Client
 *
 * Usage:
 * ```ts
 * import { LemonadeClient } from '@lemonade/sdk';
 *
 * const client = new LemonadeClient({
 *   apiKey: 'your-api-key',
 *   baseUrl: 'https://api.gigaboo.sg', // optional
 * });
 *
 * // Login
 * const tokens = await client.auth.login('user@example.com', 'password');
 *
 * // Set access token for authenticated requests
 * client.setAccessToken(tokens.access_token);
 *
 * // Get current user
 * const user = await client.auth.me();
 * ```
 */

import { OpenAPI } from './generated/core/OpenAPI';
import { AuthenticationService } from './generated/services/AuthenticationService';
import { SubscriptionsService } from './generated/services/SubscriptionsService';
import { OrganizationsService } from './generated/services/OrganizationsService';
import { StorageService } from './generated/services/StorageService';
import { EmailService } from './generated/services/EmailService';
import { GoogleDriveService } from './generated/services/GoogleDriveService';
import { GoogleWorkspaceService } from './generated/services/GoogleWorkspaceService';
import { ShenbiProgressService } from './generated/services/ShenbiProgressService';
import { ShenbiAchievementsService } from './generated/services/ShenbiAchievementsService';
import { ShenbiClassroomsService } from './generated/services/ShenbiClassroomsService';
import { ShenbiSessionsService } from './generated/services/ShenbiSessionsService';
import { ShenbiSettingsService } from './generated/services/ShenbiSettingsService';
import { ShenbiProfileService } from './generated/services/ShenbiProfileService';
import { ShenbiBattlesService } from './generated/services/ShenbiBattlesService';
import type { UserCreate, UserLogin, DeviceLogin, GoogleAuthRequest, RefreshTokenRequest, SwitchOrgRequest } from './index';
import type { OrganizationCreate, OrganizationUpdate, InvitationCreate, InvitationAccept, MemberRoleUpdate } from './index';
import type { EmailTemplateCreate, EmailTemplateUpdate, SendEmailRequest, EmailPreviewRequest } from './index';
import type { app__schemas__email__SendTemplateEmailRequest } from './generated/models/app__schemas__email__SendTemplateEmailRequest';
import type { JsonUploadRequest, ExportFileRequest, ShareFileRequest } from './index';
import type { ProgressCreate, AchievementCreate } from './index';
import type { ClassroomCreate, ClassroomUpdate, JoinClassroomRequest, AssignmentCreate, AssignmentUpdate, SubmissionGrade } from './index';
import type { BattleSessionCreate, ClassroomSessionCreate } from './index';
import type { SettingsUpdate, ProfileUpdate } from './index';
import type { BattleCreate, BattleJoin, BattleStart, BattleComplete } from './index';

export interface LemonadeClientConfig {
  apiKey: string;
  baseUrl?: string;
  accessToken?: string;
}

export class LemonadeClient {
  private apiKey: string;
  private _accessToken?: string;

  constructor(config: LemonadeClientConfig) {
    this.apiKey = config.apiKey;
    this._accessToken = config.accessToken;

    // Configure OpenAPI base URL (empty string = same origin)
    OpenAPI.BASE = config.baseUrl ?? '';
  }

  /**
   * Set the access token for authenticated requests
   */
  setAccessToken(token: string): void {
    this._accessToken = token;
    OpenAPI.TOKEN = token;
  }

  /**
   * Clear the access token (logout)
   */
  clearAccessToken(): void {
    this._accessToken = undefined;
    OpenAPI.TOKEN = undefined;
  }

  /**
   * Get the current access token
   */
  get accessToken(): string | undefined {
    return this._accessToken;
  }

  // ============================================================================
  // Auth Service
  // ============================================================================

  get auth() {
    const apiKey = this.apiKey;
    return {
      signup: (data: UserCreate) =>
        AuthenticationService.signupApiV1AuthSignupPost(apiKey, data),

      login: (data: UserLogin) =>
        AuthenticationService.loginApiV1AuthLoginPost(apiKey, data),

      loginWithDevice: (data: DeviceLogin) =>
        AuthenticationService.deviceLoginApiV1AuthDevicePost(apiKey, data),

      loginWithGoogle: (data: GoogleAuthRequest) =>
        AuthenticationService.googleLoginApiV1AuthGooglePost(apiKey, data),

      refresh: (data: RefreshTokenRequest) =>
        AuthenticationService.refreshTokenApiV1AuthRefreshPost(apiKey, data),

      me: () =>
        AuthenticationService.getMeApiV1AuthMeGet(apiKey),

      switchOrg: (data: SwitchOrgRequest) =>
        AuthenticationService.switchOrganizationApiV1AuthSwitchOrgPost(apiKey, data),

      clearOrg: () =>
        AuthenticationService.clearOrganizationContextApiV1AuthClearOrgPost(apiKey),

      revoke: (googleToken?: string) =>
        AuthenticationService.revokeTokenApiV1AuthRevokePost(apiKey, googleToken),

      checkLicense: () =>
        AuthenticationService.checkLicenseApiV1AuthLicenseGet(apiKey),
    };
  }

  // ============================================================================
  // Subscriptions Service
  // ============================================================================

  get subscriptions() {
    const apiKey = this.apiKey;
    return {
      listPlans: () =>
        SubscriptionsService.listPlansApiV1SubscriptionsPlansGet(apiKey),

      getCurrent: () =>
        SubscriptionsService.getCurrentSubscriptionApiV1SubscriptionsCurrentGet(apiKey),

      createCheckout: (planId: number, successUrl: string, cancelUrl: string) =>
        SubscriptionsService.createCheckoutApiV1SubscriptionsCheckoutPost(planId, successUrl, cancelUrl, apiKey),

      createPortal: (returnUrl: string) =>
        SubscriptionsService.createPortalApiV1SubscriptionsPortalPost(returnUrl, apiKey),
    };
  }

  // ============================================================================
  // Organizations Service
  // ============================================================================

  get organizations() {
    const apiKey = this.apiKey;
    return {
      create: (data: OrganizationCreate) =>
        OrganizationsService.createOrganizationApiV1OrganizationsPost(apiKey, data),

      list: () =>
        OrganizationsService.listMyOrganizationsApiV1OrganizationsGet(apiKey),

      getCurrent: () =>
        OrganizationsService.getCurrentOrganizationApiV1OrganizationsCurrentGet(apiKey),

      update: (data: OrganizationUpdate) =>
        OrganizationsService.updateOrganizationApiV1OrganizationsCurrentPatch(apiKey, data),

      delete: () =>
        OrganizationsService.deleteOrganizationApiV1OrganizationsCurrentDelete(apiKey),

      listMembers: () =>
        OrganizationsService.listMembersApiV1OrganizationsCurrentMembersGet(apiKey),

      updateMemberRole: (userId: number, data: MemberRoleUpdate) =>
        OrganizationsService.updateMemberRoleApiV1OrganizationsCurrentMembersUserIdPatch(userId, apiKey, data),

      removeMember: (userId: number) =>
        OrganizationsService.removeMemberApiV1OrganizationsCurrentMembersUserIdDelete(userId, apiKey),

      leave: () =>
        OrganizationsService.leaveOrganizationApiV1OrganizationsCurrentLeavePost(apiKey),

      createInvitation: (data: InvitationCreate) =>
        OrganizationsService.createInvitationApiV1OrganizationsCurrentInvitationsPost(apiKey, data),

      listInvitations: () =>
        OrganizationsService.listInvitationsApiV1OrganizationsCurrentInvitationsGet(apiKey),

      revokeInvitation: (invitationId: number) =>
        OrganizationsService.revokeInvitationApiV1OrganizationsCurrentInvitationsInvitationIdDelete(invitationId, apiKey),

      acceptInvitation: (data: InvitationAccept) =>
        OrganizationsService.acceptInvitationApiV1OrganizationsAcceptInvitationPost(apiKey, data),

      checkout: (planId: number, successUrl: string, cancelUrl: string) =>
        OrganizationsService.createOrgCheckoutApiV1OrganizationsCurrentCheckoutPost(planId, successUrl, cancelUrl, apiKey),

      portal: (returnUrl: string) =>
        OrganizationsService.createOrgPortalApiV1OrganizationsCurrentPortalPost(returnUrl, apiKey),

      getSubscription: () =>
        OrganizationsService.getOrgSubscriptionApiV1OrganizationsCurrentSubscriptionGet(apiKey),
    };
  }

  // ============================================================================
  // Storage Service
  // ============================================================================

  get storage() {
    const apiKey = this.apiKey;
    return {
      status: () =>
        StorageService.storageStatusApiV1StorageStatusGet(apiKey),

      upload: (formData: { file: Blob; folder?: string }) =>
        StorageService.uploadFileApiV1StorageUploadPost(apiKey, formData),

      uploadShared: (formData: { file: Blob; folder?: string }) =>
        StorageService.uploadSharedFileApiV1StorageUploadSharedPost(apiKey, formData),

      uploadJson: (data: JsonUploadRequest) =>
        StorageService.uploadJsonApiV1StorageUploadJsonPost(apiKey, data),

      download: (path: string) =>
        StorageService.downloadFileApiV1StorageDownloadGet(path, apiKey),

      downloadJson: (path: string) =>
        StorageService.downloadJsonApiV1StorageDownloadJsonGet(path, apiKey),

      getSignedUrl: (path: string, expiresIn?: number) =>
        StorageService.getSignedUrlApiV1StorageSignedUrlGet(path, apiKey, expiresIn),

      listFiles: (folder?: string, prefix?: string) =>
        StorageService.listUserFilesApiV1StorageFilesGet(apiKey, folder, prefix),

      listSharedFiles: (folder?: string, prefix?: string) =>
        StorageService.listSharedFilesApiV1StorageFilesSharedGet(apiKey, folder, prefix),

      delete: (path: string) =>
        StorageService.deleteFileApiV1StorageFileDelete(path, apiKey),
    };
  }

  // ============================================================================
  // Email Service
  // ============================================================================

  get email() {
    const apiKey = this.apiKey;
    return {
      listTemplates: () =>
        EmailService.listTemplatesApiV1EmailTemplatesGet(apiKey),

      createTemplate: (data: EmailTemplateCreate) =>
        EmailService.createTemplateApiV1EmailTemplatesPost(apiKey, data),

      getTemplate: (templateId: number) =>
        EmailService.getTemplateApiV1EmailTemplatesTemplateIdGet(templateId, apiKey),

      updateTemplate: (templateId: number, data: EmailTemplateUpdate) =>
        EmailService.updateTemplateApiV1EmailTemplatesTemplateIdPut(templateId, apiKey, data),

      deleteTemplate: (templateId: number) =>
        EmailService.deleteTemplateApiV1EmailTemplatesTemplateIdDelete(templateId, apiKey),

      send: (data: SendEmailRequest) =>
        EmailService.sendEmailApiV1EmailSendPost(apiKey, data),

      sendTemplate: (data: app__schemas__email__SendTemplateEmailRequest) =>
        EmailService.sendTemplateEmailApiV1EmailSendTemplatePost(apiKey, data),

      preview: (data: EmailPreviewRequest) =>
        EmailService.previewTemplateApiV1EmailPreviewPost(apiKey, data),

      status: () =>
        EmailService.emailStatusApiV1EmailStatusGet(apiKey),
    };
  }

  // ============================================================================
  // Google Drive Service
  // ============================================================================

  get drive() {
    const apiKey = this.apiKey;
    return {
      status: () =>
        GoogleDriveService.driveStatusApiV1DriveStatusGet(apiKey),

      getAuthUrl: (redirectUri?: string) =>
        GoogleDriveService.getAuthUrlApiV1DriveAuthUrlGet(apiKey, redirectUri),

      disconnect: () =>
        GoogleDriveService.disconnectDriveApiV1DriveDisconnectPost(apiKey),

      listFiles: (pageSize?: number, pageToken?: string, folderId?: string, mimeType?: string) =>
        GoogleDriveService.listFilesApiV1DriveFilesGet(apiKey, pageSize, pageToken, folderId, mimeType),

      getFile: (fileId: string) =>
        GoogleDriveService.getFileApiV1DriveFilesFileIdGet(fileId, apiKey),

      search: (q: string, pageSize?: number, pageToken?: string) =>
        GoogleDriveService.searchFilesApiV1DriveSearchGet(q, apiKey, pageSize, pageToken),

      export: (fileId: string, data: ExportFileRequest) =>
        GoogleDriveService.exportFileApiV1DriveFilesFileIdExportPost(fileId, apiKey, data),

      share: (fileId: string, data: ShareFileRequest) =>
        GoogleDriveService.shareFileApiV1DriveFilesFileIdSharePost(fileId, apiKey, data),

      listFolders: (folderId?: string, pageSize?: number, pageToken?: string) =>
        GoogleDriveService.listFoldersApiV1DriveFoldersGet(apiKey, folderId, pageSize, pageToken),

      listDocuments: (pageSize?: number, pageToken?: string) =>
        GoogleDriveService.listDocumentsApiV1DriveDocumentsGet(apiKey, pageSize, pageToken),

      listSpreadsheets: (pageSize?: number, pageToken?: string) =>
        GoogleDriveService.listSpreadsheetsApiV1DriveSpreadsheetsGet(apiKey, pageSize, pageToken),

      listPresentations: (pageSize?: number, pageToken?: string) =>
        GoogleDriveService.listPresentationsApiV1DrivePresentationsGet(apiKey, pageSize, pageToken),
    };
  }

  // ============================================================================
  // Google Workspace Service (Docs, Sheets, Slides)
  // ============================================================================

  get workspace() {
    const apiKey = this.apiKey;
    return {
      // Docs
      getDocument: (documentId: string) =>
        GoogleWorkspaceService.getDocumentApiV1WorkspaceDocsDocumentIdGet(documentId, apiKey),

      getDocumentText: (documentId: string) =>
        GoogleWorkspaceService.getDocumentTextApiV1WorkspaceDocsDocumentIdTextGet(documentId, apiKey),

      getDocumentStructure: (documentId: string) =>
        GoogleWorkspaceService.getDocumentStructureApiV1WorkspaceDocsDocumentIdStructureGet(documentId, apiKey),

      // Sheets
      getSpreadsheet: (spreadsheetId: string) =>
        GoogleWorkspaceService.getSpreadsheetApiV1WorkspaceSheetsSpreadsheetIdGet(spreadsheetId, apiKey),

      getSheetValues: (spreadsheetId: string, range?: string) =>
        GoogleWorkspaceService.getSheetValuesApiV1WorkspaceSheetsSpreadsheetIdValuesGet(spreadsheetId, apiKey, range),

      getSheetValuesBatch: (spreadsheetId: string, ranges: string[]) =>
        GoogleWorkspaceService.getSheetValuesBatchApiV1WorkspaceSheetsSpreadsheetIdValuesBatchPost(spreadsheetId, apiKey, ranges),

      // Slides
      getPresentation: (presentationId: string) =>
        GoogleWorkspaceService.getPresentationApiV1WorkspaceSlidesPresentationIdGet(presentationId, apiKey),

      getPresentationSummary: (presentationId: string) =>
        GoogleWorkspaceService.getPresentationSummaryApiV1WorkspaceSlidesPresentationIdSummaryGet(presentationId, apiKey),

      getSlide: (presentationId: string, slideIndex: number) =>
        GoogleWorkspaceService.getSlideApiV1WorkspaceSlidesPresentationIdSlideSlideIndexGet(presentationId, slideIndex, apiKey),

      getPresentationText: (presentationId: string) =>
        GoogleWorkspaceService.getPresentationTextApiV1WorkspaceSlidesPresentationIdTextGet(presentationId, apiKey),
    };
  }

  // ============================================================================
  // Shenbi Profile Service
  // ============================================================================

  get shenbiProfile() {
    const apiKey = this.apiKey;
    return {
      get: () =>
        ShenbiProfileService.getProfileApiV1ShenbiProfileGet(apiKey),

      update: (data: ProfileUpdate) =>
        ShenbiProfileService.updateProfileApiV1ShenbiProfilePut(apiKey, data),

      getStats: () =>
        ShenbiProfileService.getStatsApiV1ShenbiProfileStatsGet(apiKey),
    };
  }

  // ============================================================================
  // Shenbi Progress Service
  // ============================================================================

  get shenbiProgress() {
    const apiKey = this.apiKey;
    return {
      getAll: () =>
        ShenbiProgressService.getAllProgressApiV1ShenbiProgressGet(apiKey),

      save: (data: ProgressCreate) =>
        ShenbiProgressService.saveProgressApiV1ShenbiProgressPost(apiKey, data),

      getByAdventure: (adventureSlug: string) =>
        ShenbiProgressService.getAdventureProgressApiV1ShenbiProgressAdventureAdventureSlugGet(adventureSlug, apiKey),

      getByLevel: (adventureSlug: string, levelSlug: string) =>
        ShenbiProgressService.getLevelProgressApiV1ShenbiProgressLevelAdventureSlugLevelSlugGet(adventureSlug, levelSlug, apiKey),
    };
  }

  // ============================================================================
  // Shenbi Achievements Service
  // ============================================================================

  get shenbiAchievements() {
    const apiKey = this.apiKey;
    return {
      list: () =>
        ShenbiAchievementsService.listAchievementsApiV1ShenbiAchievementsGet(apiKey),

      award: (data: AchievementCreate) =>
        ShenbiAchievementsService.awardAchievementApiV1ShenbiAchievementsPost(apiKey, data),

      check: (achievementId: string) =>
        ShenbiAchievementsService.checkAchievementApiV1ShenbiAchievementsCheckAchievementIdGet(achievementId, apiKey),
    };
  }

  // ============================================================================
  // Shenbi Classrooms Service
  // ============================================================================

  get shenbiClassrooms() {
    const apiKey = this.apiKey;
    return {
      create: (data: ClassroomCreate) =>
        ShenbiClassroomsService.createClassroomApiV1ShenbiClassroomsPost(apiKey, data),

      listOwned: () =>
        ShenbiClassroomsService.listMyClassroomsApiV1ShenbiClassroomsGet(apiKey),

      listEnrolled: () =>
        ShenbiClassroomsService.listEnrolledClassroomsApiV1ShenbiClassroomsEnrolledGet(apiKey),

      get: (classroomId: number) =>
        ShenbiClassroomsService.getClassroomApiV1ShenbiClassroomsClassroomIdGet(classroomId, apiKey),

      update: (classroomId: number, data: ClassroomUpdate) =>
        ShenbiClassroomsService.updateClassroomApiV1ShenbiClassroomsClassroomIdPut(classroomId, apiKey, data),

      delete: (classroomId: number) =>
        ShenbiClassroomsService.deleteClassroomApiV1ShenbiClassroomsClassroomIdDelete(classroomId, apiKey),

      regenerateCode: (classroomId: number) =>
        ShenbiClassroomsService.regenerateJoinCodeApiV1ShenbiClassroomsClassroomIdRegenerateCodePost(classroomId, apiKey),

      join: (data: JoinClassroomRequest) =>
        ShenbiClassroomsService.joinClassroomApiV1ShenbiClassroomsJoinPost(apiKey, data),

      leave: (classroomId: number) =>
        ShenbiClassroomsService.leaveClassroomApiV1ShenbiClassroomsClassroomIdLeavePost(classroomId, apiKey),

      // Members
      listMembers: (classroomId: number) =>
        ShenbiClassroomsService.listMembersApiV1ShenbiClassroomsClassroomIdMembersGet(classroomId, apiKey),

      removeMember: (classroomId: number, studentId: number) =>
        ShenbiClassroomsService.removeMemberApiV1ShenbiClassroomsClassroomIdMembersStudentIdDelete(classroomId, studentId, apiKey),

      // Assignments
      createAssignment: (classroomId: number, data: AssignmentCreate) =>
        ShenbiClassroomsService.createAssignmentApiV1ShenbiClassroomsClassroomIdAssignmentsPost(classroomId, apiKey, data),

      listAssignments: (classroomId: number, includeDrafts: boolean = false) =>
        ShenbiClassroomsService.listAssignmentsApiV1ShenbiClassroomsClassroomIdAssignmentsGet(classroomId, apiKey, includeDrafts),

      getAssignment: (classroomId: number, assignmentId: number) =>
        ShenbiClassroomsService.getAssignmentApiV1ShenbiClassroomsClassroomIdAssignmentsAssignmentIdGet(classroomId, assignmentId, apiKey),

      updateAssignment: (classroomId: number, assignmentId: number, data: AssignmentUpdate) =>
        ShenbiClassroomsService.updateAssignmentApiV1ShenbiClassroomsClassroomIdAssignmentsAssignmentIdPut(classroomId, assignmentId, apiKey, data),

      deleteAssignment: (classroomId: number, assignmentId: number) =>
        ShenbiClassroomsService.deleteAssignmentApiV1ShenbiClassroomsClassroomIdAssignmentsAssignmentIdDelete(classroomId, assignmentId, apiKey),

      publishAssignment: (classroomId: number, assignmentId: number) =>
        ShenbiClassroomsService.publishAssignmentApiV1ShenbiClassroomsClassroomIdAssignmentsAssignmentIdPublishPost(classroomId, assignmentId, apiKey),

      // Submissions
      listSubmissions: (classroomId: number, assignmentId: number) =>
        ShenbiClassroomsService.listSubmissionsApiV1ShenbiClassroomsClassroomIdAssignmentsAssignmentIdSubmissionsGet(classroomId, assignmentId, apiKey),

      gradeSubmission: (classroomId: number, assignmentId: number, submissionId: number, data: SubmissionGrade) =>
        ShenbiClassroomsService.gradeSubmissionApiV1ShenbiClassroomsClassroomIdAssignmentsAssignmentIdSubmissionsSubmissionIdPut(classroomId, assignmentId, submissionId, apiKey, data),

      // Gradebook
      getGradebook: (classroomId: number) =>
        ShenbiClassroomsService.getGradebookApiV1ShenbiClassroomsClassroomIdGradebookGet(classroomId, apiKey),
    };
  }

  // ============================================================================
  // Shenbi Sessions Service
  // ============================================================================

  get shenbiSessions() {
    const apiKey = this.apiKey;
    return {
      getBattle: () =>
        ShenbiSessionsService.getBattleSessionApiV1ShenbiSessionsBattleGet(apiKey),

      createBattle: (data: BattleSessionCreate) =>
        ShenbiSessionsService.createBattleSessionApiV1ShenbiSessionsBattlePost(apiKey, data),

      endBattle: () =>
        ShenbiSessionsService.endBattleSessionApiV1ShenbiSessionsBattleDelete(apiKey),

      getClassroom: () =>
        ShenbiSessionsService.getClassroomSessionApiV1ShenbiSessionsClassroomGet(apiKey),

      createClassroom: (data: ClassroomSessionCreate) =>
        ShenbiSessionsService.createClassroomSessionApiV1ShenbiSessionsClassroomPost(apiKey, data),

      endClassroom: () =>
        ShenbiSessionsService.endClassroomSessionApiV1ShenbiSessionsClassroomDelete(apiKey),
    };
  }

  // ============================================================================
  // Shenbi Settings Service
  // ============================================================================

  get shenbiSettings() {
    const apiKey = this.apiKey;
    return {
      get: () =>
        ShenbiSettingsService.getSettingsApiV1ShenbiSettingsGet(apiKey),

      update: (data: SettingsUpdate) =>
        ShenbiSettingsService.updateSettingsApiV1ShenbiSettingsPut(apiKey, data),

      completeTour: (tourId: string) =>
        ShenbiSettingsService.completeTourApiV1ShenbiSettingsTourTourIdCompletePost(tourId, apiKey),
    };
  }

  // ============================================================================
  // Shenbi Battles Service (Polling-based 1v1 battles)
  // ============================================================================

  get shenbiBattles() {
    const apiKey = this.apiKey;
    return {
      /**
       * Create a new battle room. The caller becomes the host.
       * @param data - player_name for display
       * @returns Battle room with room_code for guest to join
       */
      create: (data: BattleCreate) =>
        ShenbiBattlesService.createBattleApiV1ShenbiBattlesPost(apiKey, data),

      /**
       * Join an existing battle room as guest.
       * @param data - room_code and player_name
       * @returns Updated battle room state
       */
      join: (data: BattleJoin) =>
        ShenbiBattlesService.joinBattleApiV1ShenbiBattlesJoinPost(apiKey, data),

      /**
       * Get current battle state. Poll every 500-1000ms.
       * @param roomCode - The room code to query
       * @returns Current battle state
       */
      get: (roomCode: string) =>
        ShenbiBattlesService.getBattleApiV1ShenbiBattlesRoomCodeGet(roomCode, apiKey),

      /**
       * Start the battle (host only). Sets the level and begins the game.
       * @param roomCode - The room code
       * @param data - Level configuration
       * @returns Updated battle state
       */
      start: (roomCode: string, data: BattleStart) =>
        ShenbiBattlesService.startBattleApiV1ShenbiBattlesRoomCodeStartPost(roomCode, apiKey, data),

      /**
       * Mark player as completed. First to complete wins.
       * @param roomCode - The room code
       * @param data - The solution code
       * @returns Battle completion status with winner info
       */
      complete: (roomCode: string, data: BattleComplete) =>
        ShenbiBattlesService.completeBattleApiV1ShenbiBattlesRoomCodeCompletePost(roomCode, apiKey, data),

      /**
       * Leave the battle room.
       * - Host leaves before start: room deleted
       * - Guest leaves before start: room resets to waiting
       * - Anyone leaves during game: other player wins
       * @param roomCode - The room code
       */
      leave: (roomCode: string) =>
        ShenbiBattlesService.leaveBattleApiV1ShenbiBattlesRoomCodeLeavePost(roomCode, apiKey),
    };
  }
}

// Re-export types for convenience
export * from './index';
