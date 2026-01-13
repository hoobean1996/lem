/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SettingsResponse } from '../models/SettingsResponse';
import type { SettingsUpdate } from '../models/SettingsUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ShenbiSettingsService {
    /**
     * Get Settings
     * Get current user's settings.
     * @param xApiKey
     * @returns SettingsResponse Successful Response
     * @throws ApiError
     */
    public static getSettingsApiV1ShenbiSettingsGet(
        xApiKey: string,
    ): CancelablePromise<SettingsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/shenbi/settings',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Settings
     * Update current user's settings.
     * @param xApiKey
     * @param requestBody
     * @returns SettingsResponse Successful Response
     * @throws ApiError
     */
    public static updateSettingsApiV1ShenbiSettingsPut(
        xApiKey: string,
        requestBody: SettingsUpdate,
    ): CancelablePromise<SettingsResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/shenbi/settings',
            headers: {
                'X-API-Key': xApiKey,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Complete Tour
     * Mark a tour as completed.
     * @param tourId
     * @param xApiKey
     * @returns SettingsResponse Successful Response
     * @throws ApiError
     */
    public static completeTourApiV1ShenbiSettingsTourTourIdCompletePost(
        tourId: string,
        xApiKey: string,
    ): CancelablePromise<SettingsResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/shenbi/settings/tour/{tour_id}/complete',
            path: {
                'tour_id': tourId,
            },
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
