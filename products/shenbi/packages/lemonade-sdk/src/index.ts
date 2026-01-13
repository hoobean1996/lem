/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

// Export the main client
export { LemonadeClient } from './client';
export type { LemonadeClientConfig } from './client';

export { ApiError } from './generated/core/ApiError';
export { CancelablePromise, CancelError } from './generated/core/CancelablePromise';
export { OpenAPI } from './generated/core/OpenAPI';
export type { OpenAPIConfig } from './generated/core/OpenAPI';

// Models
export type { AppCreate } from './generated/models/AppCreate';
export type { AppResponse } from './generated/models/AppResponse';
export { BillingInterval } from './generated/models/BillingInterval';
export type { Body_admin_upload_storage_file_admin_apps__app_id__storage_upload_post } from './generated/models/Body_admin_upload_storage_file_admin_apps__app_id__storage_upload_post';
export type { Body_upload_file_api_v1_storage_upload_post } from './generated/models/Body_upload_file_api_v1_storage_upload_post';
export type { Body_upload_shared_file_api_v1_storage_upload_shared_post } from './generated/models/Body_upload_shared_file_api_v1_storage_upload_shared_post';
export type { CheckoutSessionResponse } from './generated/models/CheckoutSessionResponse';
export type { DeleteResponse } from './generated/models/DeleteResponse';
export type { DeviceLogin } from './generated/models/DeviceLogin';
export type { DriveAuthUrlResponse } from './generated/models/DriveAuthUrlResponse';
export type { DriveFileListResponse } from './generated/models/DriveFileListResponse';
export type { DriveFileSchema } from './generated/models/DriveFileSchema';
export type { DriveStatusResponse } from './generated/models/DriveStatusResponse';
export type { EmailPreviewRequest } from './generated/models/EmailPreviewRequest';
export type { EmailPreviewResponse } from './generated/models/EmailPreviewResponse';
export type { EmailResponse } from './generated/models/EmailResponse';
export type { EmailTemplateCreate } from './generated/models/EmailTemplateCreate';
export type { EmailTemplateResponse } from './generated/models/EmailTemplateResponse';
export type { EmailTemplateUpdate } from './generated/models/EmailTemplateUpdate';
export type { ExportFileRequest } from './generated/models/ExportFileRequest';
export type { FileInfoResponse } from './generated/models/FileInfoResponse';
export type { FileListResponse } from './generated/models/FileListResponse';
export type { FileUploadResponse } from './generated/models/FileUploadResponse';
export type { GoogleAuthRequest } from './generated/models/GoogleAuthRequest';
export type { HTTPValidationError } from './generated/models/HTTPValidationError';
export type { InvitationAccept } from './generated/models/InvitationAccept';
export type { InvitationCreate } from './generated/models/InvitationCreate';
export type { InvitationResponse } from './generated/models/InvitationResponse';
export { InvitationStatus } from './generated/models/InvitationStatus';
export type { JsonUploadRequest } from './generated/models/JsonUploadRequest';
export type { MemberResponse } from './generated/models/MemberResponse';
// Shenbi-specific member response (for classroom members)
export type { app__schemas__shenbi__classroom__MemberResponse as ShenbiMemberResponse } from './generated/models/app__schemas__shenbi__classroom__MemberResponse';
export type { MemberRoleUpdate } from './generated/models/MemberRoleUpdate';
export type { OrganizationCreate } from './generated/models/OrganizationCreate';
export type { OrganizationDetailResponse } from './generated/models/OrganizationDetailResponse';
export type { OrganizationResponse } from './generated/models/OrganizationResponse';
export type { OrganizationUpdate } from './generated/models/OrganizationUpdate';
export type { OrgContext } from './generated/models/OrgContext';
export type { OrgContextInToken } from './generated/models/OrgContextInToken';
export { OrgRole } from './generated/models/OrgRole';
export type { PlanCreate } from './generated/models/PlanCreate';
export type { PlanResponse } from './generated/models/PlanResponse';
export type { PortalSessionResponse } from './generated/models/PortalSessionResponse';
export type { RefreshTokenRequest } from './generated/models/RefreshTokenRequest';
export type { SendEmailRequest } from './generated/models/SendEmailRequest';
export type { SendTemplateEmailRequest } from './generated/models/SendTemplateEmailRequest';
export type { ShareFileRequest } from './generated/models/ShareFileRequest';
export type { SignedUrlResponse } from './generated/models/SignedUrlResponse';
export type { StorageStatusResponse } from './generated/models/StorageStatusResponse';
export type { SubscriptionResponse } from './generated/models/SubscriptionResponse';
export { SubscriptionStatus } from './generated/models/SubscriptionStatus';
export type { SwitchOrgRequest } from './generated/models/SwitchOrgRequest';
export type { TokenResponse } from './generated/models/TokenResponse';
export type { TokenWithOrgResponse } from './generated/models/TokenWithOrgResponse';
export type { UserCreate } from './generated/models/UserCreate';
export type { UserLogin } from './generated/models/UserLogin';
export type { UserOrganizationsResponse } from './generated/models/UserOrganizationsResponse';
export type { UserResponse } from './generated/models/UserResponse';
export type { ValidationError } from './generated/models/ValidationError';

// Services
export { AdminService } from './generated/services/AdminService';
export { AdminWebService } from './generated/services/AdminWebService';
export { AuthenticationService } from './generated/services/AuthenticationService';
export { DefaultService } from './generated/services/DefaultService';
export { EmailService } from './generated/services/EmailService';
export { GoogleDriveService } from './generated/services/GoogleDriveService';
export { GoogleWorkspaceService } from './generated/services/GoogleWorkspaceService';
export { OrganizationsService } from './generated/services/OrganizationsService';
export { StorageService } from './generated/services/StorageService';
export { SubscriptionsService } from './generated/services/SubscriptionsService';

// Shenbi Services
export { ShenbiAchievementsService } from './generated/services/ShenbiAchievementsService';
export { ShenbiBattlesService } from './generated/services/ShenbiBattlesService';
export { ShenbiClassroomsService } from './generated/services/ShenbiClassroomsService';
export { ShenbiProfileService } from './generated/services/ShenbiProfileService';
export { ShenbiProgressService } from './generated/services/ShenbiProgressService';
export { ShenbiSessionsService } from './generated/services/ShenbiSessionsService';
export { ShenbiSettingsService } from './generated/services/ShenbiSettingsService';

// Shenbi Models
export type { AchievementCreate } from './generated/models/AchievementCreate';
export type { AchievementResponse } from './generated/models/AchievementResponse';
export type { AssignmentCreate } from './generated/models/AssignmentCreate';
export type { AssignmentResponse } from './generated/models/AssignmentResponse';
export { AssignmentStatus } from './generated/models/AssignmentStatus';
export type { AssignmentUpdate } from './generated/models/AssignmentUpdate';
export type { BattleSessionCreate } from './generated/models/BattleSessionCreate';
export type { BattleSessionResponse } from './generated/models/BattleSessionResponse';
// Battle Models (Polling-based)
export type { BattleCreate } from './generated/models/BattleCreate';
export type { BattleJoin } from './generated/models/BattleJoin';
export type { BattleStart } from './generated/models/BattleStart';
export type { BattleComplete } from './generated/models/BattleComplete';
export type { BattleResponse } from './generated/models/BattleResponse';
export type { BattleStartResponse } from './generated/models/BattleStartResponse';
export type { BattleCompleteResponse } from './generated/models/BattleCompleteResponse';
export type { BattleLeaveResponse } from './generated/models/BattleLeaveResponse';
export type { ClassroomCreate } from './generated/models/ClassroomCreate';
export type { ClassroomResponse } from './generated/models/ClassroomResponse';
export type { ClassroomSessionCreate } from './generated/models/ClassroomSessionCreate';
export type { ClassroomSessionResponse } from './generated/models/ClassroomSessionResponse';
export type { ClassroomUpdate } from './generated/models/ClassroomUpdate';
export type { GradebookEntry } from './generated/models/GradebookEntry';
export type { JoinClassroomRequest } from './generated/models/JoinClassroomRequest';
export type { ProfileResponse } from './generated/models/ProfileResponse';
export type { ProfileUpdate } from './generated/models/ProfileUpdate';
export type { ProgressCreate } from './generated/models/ProgressCreate';
export type { ProgressResponse } from './generated/models/ProgressResponse';
export type { SettingsResponse } from './generated/models/SettingsResponse';
export type { SettingsUpdate } from './generated/models/SettingsUpdate';
export type { StatsResponse } from './generated/models/StatsResponse';
export type { SubmissionGrade } from './generated/models/SubmissionGrade';
export type { SubmissionResponse } from './generated/models/SubmissionResponse';
