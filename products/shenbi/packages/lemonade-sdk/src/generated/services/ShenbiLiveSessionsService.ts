/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { JoinByCodeResponse } from '../models/JoinByCodeResponse';
import type { LiveSessionEndResponse } from '../models/LiveSessionEndResponse';
import type { LiveSessionJoin } from '../models/LiveSessionJoin';
import type { LiveSessionJoinByCode } from '../models/LiveSessionJoinByCode';
import type { LiveSessionLeaveResponse } from '../models/LiveSessionLeaveResponse';
import type { LiveSessionProgressResponse } from '../models/LiveSessionProgressResponse';
import type { LiveSessionResetResponse } from '../models/LiveSessionResetResponse';
import type { LiveSessionResponse } from '../models/LiveSessionResponse';
import type { LiveSessionSetLevel } from '../models/LiveSessionSetLevel';
import type { LiveSessionSetLevelResponse } from '../models/LiveSessionSetLevelResponse';
import type { LiveSessionStartResponse } from '../models/LiveSessionStartResponse';
import type { LiveSessionStudentResponse } from '../models/LiveSessionStudentResponse';
import type { LiveSessionUpdateProgress } from '../models/LiveSessionUpdateProgress';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ShenbiLiveSessionsService {
    /**
     * Start Live Session
     * Start a new live session for a classroom (teacher only).
     *
     * Creates a new live session with a unique room code that students can use to join.
     * @param classroomId
     * @param xApiKey
     * @returns LiveSessionResponse Successful Response
     * @throws ApiError
     */
    public static startLiveSessionApiV1ShenbiClassroomsClassroomIdLivePost(
        classroomId: number,
        xApiKey: string,
    ): CancelablePromise<LiveSessionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/shenbi/classrooms/{classroom_id}/live',
            path: {
                'classroom_id': classroomId,
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
     * Get Live Session
     * Get the current state of the live session.
     *
     * Teachers see full student details, students only see their own progress + summary.
     * Poll this endpoint every 1-2 seconds for updates.
     * @param classroomId
     * @param xApiKey
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getLiveSessionApiV1ShenbiClassroomsClassroomIdLiveGet(
        classroomId: number,
        xApiKey: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/shenbi/classrooms/{classroom_id}/live',
            path: {
                'classroom_id': classroomId,
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
     * Join Live Session
     * Join an active live session as a student.
     *
     * Student must be enrolled in the classroom.
     * @param classroomId
     * @param xApiKey
     * @param requestBody
     * @returns LiveSessionStudentResponse Successful Response
     * @throws ApiError
     */
    public static joinLiveSessionApiV1ShenbiClassroomsClassroomIdLiveJoinPost(
        classroomId: number,
        xApiKey: string,
        requestBody: LiveSessionJoin,
    ): CancelablePromise<LiveSessionStudentResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/shenbi/classrooms/{classroom_id}/live/join',
            path: {
                'classroom_id': classroomId,
            },
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
     * Set Level
     * Set the level for the live session (teacher only).
     *
     * After setting the level, the session status changes to 'ready'.
     * @param classroomId
     * @param xApiKey
     * @param requestBody
     * @returns LiveSessionSetLevelResponse Successful Response
     * @throws ApiError
     */
    public static setLevelApiV1ShenbiClassroomsClassroomIdLiveLevelPut(
        classroomId: number,
        xApiKey: string,
        requestBody: LiveSessionSetLevel,
    ): CancelablePromise<LiveSessionSetLevelResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/shenbi/classrooms/{classroom_id}/live/level',
            path: {
                'classroom_id': classroomId,
            },
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
     * Start Playing
     * Start the game for all students (teacher only).
     *
     * Level must be set first. Session status changes to 'playing'.
     * @param classroomId
     * @param xApiKey
     * @returns LiveSessionStartResponse Successful Response
     * @throws ApiError
     */
    public static startPlayingApiV1ShenbiClassroomsClassroomIdLiveStartPost(
        classroomId: number,
        xApiKey: string,
    ): CancelablePromise<LiveSessionStartResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/shenbi/classrooms/{classroom_id}/live/start',
            path: {
                'classroom_id': classroomId,
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
     * Reset Session
     * Reset all student progress (teacher only).
     *
     * Useful for replaying the same level. Session goes back to 'ready' state.
     * @param classroomId
     * @param xApiKey
     * @returns LiveSessionResetResponse Successful Response
     * @throws ApiError
     */
    public static resetSessionApiV1ShenbiClassroomsClassroomIdLiveResetPost(
        classroomId: number,
        xApiKey: string,
    ): CancelablePromise<LiveSessionResetResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/shenbi/classrooms/{classroom_id}/live/reset',
            path: {
                'classroom_id': classroomId,
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
     * Update Progress
     * Update student's progress during the game (student only).
     *
     * Call this when:
     * - Collecting a star
     * - Completing the level
     * - Optionally every few seconds during play (for live teacher view)
     * @param classroomId
     * @param xApiKey
     * @param requestBody
     * @returns LiveSessionProgressResponse Successful Response
     * @throws ApiError
     */
    public static updateProgressApiV1ShenbiClassroomsClassroomIdLiveProgressPut(
        classroomId: number,
        xApiKey: string,
        requestBody: LiveSessionUpdateProgress,
    ): CancelablePromise<LiveSessionProgressResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/shenbi/classrooms/{classroom_id}/live/progress',
            path: {
                'classroom_id': classroomId,
            },
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
     * End Session
     * End the live session (teacher only).
     *
     * Returns a summary of student progress.
     * @param classroomId
     * @param xApiKey
     * @returns LiveSessionEndResponse Successful Response
     * @throws ApiError
     */
    public static endSessionApiV1ShenbiClassroomsClassroomIdLiveEndPost(
        classroomId: number,
        xApiKey: string,
    ): CancelablePromise<LiveSessionEndResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/shenbi/classrooms/{classroom_id}/live/end',
            path: {
                'classroom_id': classroomId,
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
     * Leave Session
     * Leave the live session (student only).
     *
     * The student's progress is preserved but they won't appear in the active list.
     * @param classroomId
     * @param xApiKey
     * @returns LiveSessionLeaveResponse Successful Response
     * @throws ApiError
     */
    public static leaveSessionApiV1ShenbiClassroomsClassroomIdLiveLeavePost(
        classroomId: number,
        xApiKey: string,
    ): CancelablePromise<LiveSessionLeaveResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/shenbi/classrooms/{classroom_id}/live/leave',
            path: {
                'classroom_id': classroomId,
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
     * Join By Room Code
     * Join a live session by room code.
     *
     * Convenient alternative when student doesn't know the classroom ID.
     * Student must still be enrolled in the classroom.
     * @param xApiKey
     * @param requestBody
     * @returns JoinByCodeResponse Successful Response
     * @throws ApiError
     */
    public static joinByRoomCodeApiV1ShenbiLiveJoinPost(
        xApiKey: string,
        requestBody: LiveSessionJoinByCode,
    ): CancelablePromise<JoinByCodeResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/shenbi/live/join',
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
}
