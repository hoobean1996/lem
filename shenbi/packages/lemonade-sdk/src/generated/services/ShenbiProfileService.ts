/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProfileResponse } from '../models/ProfileResponse';
import type { ProfileUpdate } from '../models/ProfileUpdate';
import type { StatsResponse } from '../models/StatsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ShenbiProfileService {
    /**
     * Get Profile
     * Get current user's Shenbi profile.
     * @param xApiKey
     * @returns ProfileResponse Successful Response
     * @throws ApiError
     */
    public static getProfileApiV1ShenbiProfileGet(
        xApiKey: string,
    ): CancelablePromise<ProfileResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/shenbi/profile',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Profile
     * Update current user's Shenbi profile.
     * @param xApiKey
     * @param requestBody
     * @returns ProfileResponse Successful Response
     * @throws ApiError
     */
    public static updateProfileApiV1ShenbiProfilePut(
        xApiKey: string,
        requestBody: ProfileUpdate,
    ): CancelablePromise<ProfileResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/shenbi/profile',
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
     * Get Stats
     * Get current user's statistics.
     * @param xApiKey
     * @returns StatsResponse Successful Response
     * @throws ApiError
     */
    public static getStatsApiV1ShenbiProfileStatsGet(
        xApiKey: string,
    ): CancelablePromise<StatsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/shenbi/profile/stats',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
