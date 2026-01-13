/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProgressCreate } from '../models/ProgressCreate';
import type { ProgressResponse } from '../models/ProgressResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ShenbiProgressService {
    /**
     * Get All Progress
     * Get all progress for current user.
     * @param xApiKey
     * @returns ProgressResponse Successful Response
     * @throws ApiError
     */
    public static getAllProgressApiV1ShenbiProgressGet(
        xApiKey: string,
    ): CancelablePromise<Array<ProgressResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/shenbi/progress',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Save Progress
     * Save progress for a level.
     * @param xApiKey
     * @param requestBody
     * @returns ProgressResponse Successful Response
     * @throws ApiError
     */
    public static saveProgressApiV1ShenbiProgressPost(
        xApiKey: string,
        requestBody: ProgressCreate,
    ): CancelablePromise<ProgressResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/shenbi/progress',
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
     * Get Adventure Progress
     * Get progress for a specific adventure.
     * @param adventureSlug
     * @param xApiKey
     * @returns ProgressResponse Successful Response
     * @throws ApiError
     */
    public static getAdventureProgressApiV1ShenbiProgressAdventureAdventureSlugGet(
        adventureSlug: string,
        xApiKey: string,
    ): CancelablePromise<Array<ProgressResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/shenbi/progress/adventure/{adventure_slug}',
            path: {
                'adventure_slug': adventureSlug,
            },
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Level Progress
     * Get progress for a specific level.
     * @param adventureSlug
     * @param levelSlug
     * @param xApiKey
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getLevelProgressApiV1ShenbiProgressLevelAdventureSlugLevelSlugGet(
        adventureSlug: string,
        levelSlug: string,
        xApiKey: string,
    ): CancelablePromise<(ProgressResponse | null)> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/shenbi/progress/level/{adventure_slug}/{level_slug}',
            path: {
                'adventure_slug': adventureSlug,
                'level_slug': levelSlug,
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
