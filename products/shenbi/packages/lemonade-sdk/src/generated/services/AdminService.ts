/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppCreate } from '../models/AppCreate';
import type { AppResponse } from '../models/AppResponse';
import type { PlanCreate } from '../models/PlanCreate';
import type { PlanResponse } from '../models/PlanResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminService {
    /**
     * Create App
     * Create a new app/tenant.
     * @param xAdminKey
     * @param requestBody
     * @returns AppResponse Successful Response
     * @throws ApiError
     */
    public static createAppApiV1AdminAppsPost(
        xAdminKey: string,
        requestBody: AppCreate,
    ): CancelablePromise<AppResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/admin/apps',
            headers: {
                'X-Admin-Key': xAdminKey,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Apps
     * List all apps.
     * @param xAdminKey
     * @returns AppResponse Successful Response
     * @throws ApiError
     */
    public static listAppsApiV1AdminAppsGet(
        xAdminKey: string,
    ): CancelablePromise<Array<AppResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/apps',
            headers: {
                'X-Admin-Key': xAdminKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get App
     * Get app by ID.
     * @param appId
     * @param xAdminKey
     * @returns AppResponse Successful Response
     * @throws ApiError
     */
    public static getAppApiV1AdminAppsAppIdGet(
        appId: number,
        xAdminKey: string,
    ): CancelablePromise<AppResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/apps/{app_id}',
            path: {
                'app_id': appId,
            },
            headers: {
                'X-Admin-Key': xAdminKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Plan
     * Create a plan for an app.
     * @param appId
     * @param xAdminKey
     * @param requestBody
     * @returns PlanResponse Successful Response
     * @throws ApiError
     */
    public static createPlanApiV1AdminAppsAppIdPlansPost(
        appId: number,
        xAdminKey: string,
        requestBody: PlanCreate,
    ): CancelablePromise<PlanResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/admin/apps/{app_id}/plans',
            path: {
                'app_id': appId,
            },
            headers: {
                'X-Admin-Key': xAdminKey,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List App Plans
     * List all plans for an app.
     * @param appId
     * @param xAdminKey
     * @returns PlanResponse Successful Response
     * @throws ApiError
     */
    public static listAppPlansApiV1AdminAppsAppIdPlansGet(
        appId: number,
        xAdminKey: string,
    ): CancelablePromise<Array<PlanResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/apps/{app_id}/plans',
            path: {
                'app_id': appId,
            },
            headers: {
                'X-Admin-Key': xAdminKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Regenerate Api Key
     * Regenerate API key for an app.
     * @param appId
     * @param xAdminKey
     * @returns AppResponse Successful Response
     * @throws ApiError
     */
    public static regenerateApiKeyApiV1AdminAppsAppIdRegenerateKeyPost(
        appId: number,
        xAdminKey: string,
    ): CancelablePromise<AppResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/admin/apps/{app_id}/regenerate-key',
            path: {
                'app_id': appId,
            },
            headers: {
                'X-Admin-Key': xAdminKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
