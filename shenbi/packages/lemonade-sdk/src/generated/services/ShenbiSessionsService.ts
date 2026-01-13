/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BattleSessionCreate } from '../models/BattleSessionCreate';
import type { BattleSessionResponse } from '../models/BattleSessionResponse';
import type { ClassroomSessionCreate } from '../models/ClassroomSessionCreate';
import type { ClassroomSessionResponse } from '../models/ClassroomSessionResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ShenbiSessionsService {
    /**
     * Get Battle Session
     * Get current user's active battle session.
     * @param xApiKey
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getBattleSessionApiV1ShenbiSessionsBattleGet(
        xApiKey: string,
    ): CancelablePromise<(BattleSessionResponse | null)> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/shenbi/sessions/battle',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Battle Session
     * Create or update a battle session.
     * @param xApiKey
     * @param requestBody
     * @returns BattleSessionResponse Successful Response
     * @throws ApiError
     */
    public static createBattleSessionApiV1ShenbiSessionsBattlePost(
        xApiKey: string,
        requestBody: BattleSessionCreate,
    ): CancelablePromise<BattleSessionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/shenbi/sessions/battle',
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
     * End Battle Session
     * End current user's battle session.
     * @param xApiKey
     * @returns void
     * @throws ApiError
     */
    public static endBattleSessionApiV1ShenbiSessionsBattleDelete(
        xApiKey: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/shenbi/sessions/battle',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Classroom Session
     * Get current user's active classroom session.
     * @param xApiKey
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getClassroomSessionApiV1ShenbiSessionsClassroomGet(
        xApiKey: string,
    ): CancelablePromise<(ClassroomSessionResponse | null)> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/shenbi/sessions/classroom',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Classroom Session
     * Create or update a classroom session.
     * @param xApiKey
     * @param requestBody
     * @returns ClassroomSessionResponse Successful Response
     * @throws ApiError
     */
    public static createClassroomSessionApiV1ShenbiSessionsClassroomPost(
        xApiKey: string,
        requestBody: ClassroomSessionCreate,
    ): CancelablePromise<ClassroomSessionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/shenbi/sessions/classroom',
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
     * End Classroom Session
     * End current user's classroom session.
     * @param xApiKey
     * @returns void
     * @throws ApiError
     */
    public static endClassroomSessionApiV1ShenbiSessionsClassroomDelete(
        xApiKey: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/shenbi/sessions/classroom',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
