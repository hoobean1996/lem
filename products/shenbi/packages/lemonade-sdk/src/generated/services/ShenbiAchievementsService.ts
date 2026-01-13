/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AchievementCreate } from '../models/AchievementCreate';
import type { AchievementResponse } from '../models/AchievementResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ShenbiAchievementsService {
    /**
     * List Achievements
     * List all achievements for current user.
     * @param xApiKey
     * @returns AchievementResponse Successful Response
     * @throws ApiError
     */
    public static listAchievementsApiV1ShenbiAchievementsGet(
        xApiKey: string,
    ): CancelablePromise<Array<AchievementResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/shenbi/achievements',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Award Achievement
     * Award an achievement to current user.
     * @param xApiKey
     * @param requestBody
     * @returns AchievementResponse Successful Response
     * @throws ApiError
     */
    public static awardAchievementApiV1ShenbiAchievementsPost(
        xApiKey: string,
        requestBody: AchievementCreate,
    ): CancelablePromise<AchievementResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/shenbi/achievements',
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
     * Check Achievement
     * Check if user has an achievement.
     * @param achievementId
     * @param xApiKey
     * @returns any Successful Response
     * @throws ApiError
     */
    public static checkAchievementApiV1ShenbiAchievementsCheckAchievementIdGet(
        achievementId: string,
        xApiKey: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/shenbi/achievements/check/{achievement_id}',
            path: {
                'achievement_id': achievementId,
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
