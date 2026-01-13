/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { app__routers__admin_web__SendEmailRequest } from '../models/app__routers__admin_web__SendEmailRequest';
import type { AppCreate } from '../models/AppCreate';
import type { Body_admin_upload_storage_file_admin_apps__app_id__storage_upload_post } from '../models/Body_admin_upload_storage_file_admin_apps__app_id__storage_upload_post';
import type { EmailTemplateCreate } from '../models/EmailTemplateCreate';
import type { EmailTemplateUpdate } from '../models/EmailTemplateUpdate';
import type { GoogleAuthRequest } from '../models/GoogleAuthRequest';
import type { OrganizationCreateRequest } from '../models/OrganizationCreateRequest';
import type { OrganizationUpdateRequest } from '../models/OrganizationUpdateRequest';
import type { PlanCreate } from '../models/PlanCreate';
import type { PlanUpdate } from '../models/PlanUpdate';
import type { SendTemplateEmailRequest } from '../models/SendTemplateEmailRequest';
import type { UpdateShenbiRoleRequest } from '../models/UpdateShenbiRoleRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminWebService {
    /**
     * Admin Google Auth
     * Handle Google Sign-In callback.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static adminGoogleAuthAdminAuthGooglePost(
        requestBody: GoogleAuthRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/auth/google',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Admin Logout
     * Logout and clear admin session.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static adminLogoutAdminLogoutGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/logout',
        });
    }
    /**
     * Admin Me
     * Get current admin user.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static adminMeAdminApiMeGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/api/me',
        });
    }
    /**
     * Admin Logout Api
     * Logout and clear admin session (for React frontend).
     * @returns any Successful Response
     * @throws ApiError
     */
    public static adminLogoutApiAdminApiLogoutPost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/api/logout',
        });
    }
    /**
     * Admin Api Apps
     * List all apps (JSON API).
     * @returns any Successful Response
     * @throws ApiError
     */
    public static adminApiAppsAdminApiAppsGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/api/apps',
        });
    }
    /**
     * Admin Api App
     * Get single app (JSON API).
     * @param appId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static adminApiAppAdminApiAppsAppIdGet(
        appId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/api/apps/{app_id}',
            path: {
                'app_id': appId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Admin Api Users
     * List users for an app (JSON API).
     * @param appId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static adminApiUsersAdminApiAppsAppIdUsersGet(
        appId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/api/apps/{app_id}/users',
            path: {
                'app_id': appId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Shenbi Role Api
     * Update a user's Shenbi profile role (JSON API).
     * @param appId
     * @param userId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateShenbiRoleApiAdminApiAppsAppIdUsersUserIdShenbiRolePost(
        appId: number,
        userId: number,
        requestBody: UpdateShenbiRoleRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/api/apps/{app_id}/users/{user_id}/shenbi-role',
            path: {
                'app_id': appId,
                'user_id': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Generate Token Api
     * Generate JWT token for a user (JSON API).
     * @param appId
     * @param userId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static generateTokenApiAdminApiAppsAppIdUsersUserIdGenerateTokenPost(
        appId: number,
        userId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/api/apps/{app_id}/users/{user_id}/generate-token',
            path: {
                'app_id': appId,
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Reset User Progress Api
     * Reset all progress and achievements for a user (JSON API).
     * @param appId
     * @param userId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static resetUserProgressApiAdminApiAppsAppIdUsersUserIdResetProgressPost(
        appId: number,
        userId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/api/apps/{app_id}/users/{user_id}/reset-progress',
            path: {
                'app_id': appId,
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Send Email Api
     * Send an email to a user (JSON API).
     * @param appId
     * @param userId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static sendEmailApiAdminApiAppsAppIdUsersUserIdSendEmailPost(
        appId: number,
        userId: number,
        requestBody: app__routers__admin_web__SendEmailRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/api/apps/{app_id}/users/{user_id}/send-email',
            path: {
                'app_id': appId,
                'user_id': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Email Templates Api
     * List email templates for an app (JSON API).
     * @param appId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listEmailTemplatesApiAdminApiAppsAppIdEmailTemplatesGet(
        appId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/api/apps/{app_id}/email-templates',
            path: {
                'app_id': appId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Send Template Email Api
     * Send a templated email to a user (JSON API).
     * @param appId
     * @param userId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static sendTemplateEmailApiAdminApiAppsAppIdUsersUserIdSendTemplateEmailPost(
        appId: number,
        userId: number,
        requestBody: SendTemplateEmailRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/api/apps/{app_id}/users/{user_id}/send-template-email',
            path: {
                'app_id': appId,
                'user_id': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Email Template Api
     * Get a single email template with full content (JSON API).
     * @param appId
     * @param templateId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getEmailTemplateApiAdminApiAppsAppIdEmailTemplatesTemplateIdGet(
        appId: number,
        templateId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/api/apps/{app_id}/email-templates/{template_id}',
            path: {
                'app_id': appId,
                'template_id': templateId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Plans Api
     * List all plans for an app (JSON API).
     * @param appId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listPlansApiAdminApiAppsAppIdPlansGet(
        appId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/api/apps/{app_id}/plans',
            path: {
                'app_id': appId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Plan Api
     * Update a plan (JSON API).
     * @param appId
     * @param planId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updatePlanApiAdminApiAppsAppIdPlansPlanIdPut(
        appId: number,
        planId: number,
        requestBody: PlanUpdate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/admin/api/apps/{app_id}/plans/{plan_id}',
            path: {
                'app_id': appId,
                'plan_id': planId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Plan Api
     * Delete a plan (JSON API).
     * @param appId
     * @param planId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deletePlanApiAdminApiAppsAppIdPlansPlanIdDelete(
        appId: number,
        planId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/admin/api/apps/{app_id}/plans/{plan_id}',
            path: {
                'app_id': appId,
                'plan_id': planId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Organizations Api
     * List all organizations for an app (JSON API).
     * @param appId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listOrganizationsApiAdminApiAppsAppIdOrganizationsGet(
        appId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/api/apps/{app_id}/organizations',
            path: {
                'app_id': appId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create App Web
     * Create a new app (web form).
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createAppWebAdminAppsPost(
        requestBody: AppCreate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/apps',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Plan Web
     * Create a new plan (web form).
     * @param appId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createPlanWebAdminAppsAppIdPlansPost(
        appId: number,
        requestBody: PlanCreate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/apps/{app_id}/plans',
            path: {
                'app_id': appId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Shenbi Role
     * Update a user's Shenbi profile role.
     * @param appId
     * @param userId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateShenbiRoleAdminAppsAppIdUsersUserIdShenbiRolePost(
        appId: number,
        userId: number,
        requestBody: UpdateShenbiRoleRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/apps/{app_id}/users/{user_id}/shenbi-role',
            path: {
                'app_id': appId,
                'user_id': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Send Email To User
     * Send an email to a user.
     * @param appId
     * @param userId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static sendEmailToUserAdminAppsAppIdUsersUserIdSendEmailPost(
        appId: number,
        userId: number,
        requestBody: app__routers__admin_web__SendEmailRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/apps/{app_id}/users/{user_id}/send-email',
            path: {
                'app_id': appId,
                'user_id': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Generate User Token
     * Generate a JWT token for a user (admin use).
     * @param appId
     * @param userId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static generateUserTokenAdminAppsAppIdUsersUserIdGenerateTokenPost(
        appId: number,
        userId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/apps/{app_id}/users/{user_id}/generate-token',
            path: {
                'app_id': appId,
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Organization
     * Create a new organization.
     * @param appId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createOrganizationAdminAppsAppIdOrganizationsPost(
        appId: number,
        requestBody: OrganizationCreateRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/apps/{app_id}/organizations',
            path: {
                'app_id': appId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Organization
     * Update an organization.
     * @param appId
     * @param orgId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateOrganizationAdminAppsAppIdOrganizationsOrgIdPut(
        appId: number,
        orgId: number,
        requestBody: OrganizationUpdateRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/admin/apps/{app_id}/organizations/{org_id}',
            path: {
                'app_id': appId,
                'org_id': orgId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Organization
     * Delete an organization.
     * @param appId
     * @param orgId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteOrganizationAdminAppsAppIdOrganizationsOrgIdDelete(
        appId: number,
        orgId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/admin/apps/{app_id}/organizations/{org_id}',
            path: {
                'app_id': appId,
                'org_id': orgId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Toggle Organization Status
     * Toggle organization active status.
     * @param appId
     * @param orgId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static toggleOrganizationStatusAdminAppsAppIdOrganizationsOrgIdToggleStatusPost(
        appId: number,
        orgId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/apps/{app_id}/organizations/{org_id}/toggle-status',
            path: {
                'app_id': appId,
                'org_id': orgId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Email Template Web
     * Create a new email template (web form).
     * @param appId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createEmailTemplateWebAdminAppsAppIdEmailTemplatesPost(
        appId: number,
        requestBody: EmailTemplateCreate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/apps/{app_id}/email-templates',
            path: {
                'app_id': appId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Email Template Web
     * Update an email template (web form).
     * @param appId
     * @param templateId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateEmailTemplateWebAdminAppsAppIdEmailTemplatesTemplateIdPut(
        appId: number,
        templateId: number,
        requestBody: EmailTemplateUpdate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/admin/apps/{app_id}/email-templates/{template_id}',
            path: {
                'app_id': appId,
                'template_id': templateId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Email Template Web
     * Delete an email template (web form).
     * @param appId
     * @param templateId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteEmailTemplateWebAdminAppsAppIdEmailTemplatesTemplateIdDelete(
        appId: number,
        templateId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/admin/apps/{app_id}/email-templates/{template_id}',
            path: {
                'app_id': appId,
                'template_id': templateId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Admin List Storage Files
     * List files in storage for an app.
     * @param appId
     * @param folder
     * @returns any Successful Response
     * @throws ApiError
     */
    public static adminListStorageFilesAdminAppsAppIdStorageFilesGet(
        appId: number,
        folder: string = 'shared',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/apps/{app_id}/storage/files',
            path: {
                'app_id': appId,
            },
            query: {
                'folder': folder,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Admin Upload Storage File
     * Upload a file to storage.
     * @param appId
     * @param folder
     * @param formData
     * @returns any Successful Response
     * @throws ApiError
     */
    public static adminUploadStorageFileAdminAppsAppIdStorageUploadPost(
        appId: number,
        folder: string = 'shared',
        formData?: Body_admin_upload_storage_file_admin_apps__app_id__storage_upload_post,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/apps/{app_id}/storage/upload',
            path: {
                'app_id': appId,
            },
            query: {
                'folder': folder,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Admin Get Signed Url
     * Get a signed URL for a file.
     * @param appId
     * @param path
     * @returns any Successful Response
     * @throws ApiError
     */
    public static adminGetSignedUrlAdminAppsAppIdStorageSignedUrlGet(
        appId: number,
        path: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/apps/{app_id}/storage/signed-url',
            path: {
                'app_id': appId,
            },
            query: {
                'path': path,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Admin Delete Storage File
     * Delete a file from storage.
     * @param appId
     * @param path
     * @returns any Successful Response
     * @throws ApiError
     */
    public static adminDeleteStorageFileAdminAppsAppIdStorageFileDelete(
        appId: number,
        path: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/admin/apps/{app_id}/storage/file',
            path: {
                'app_id': appId,
            },
            query: {
                'path': path,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
