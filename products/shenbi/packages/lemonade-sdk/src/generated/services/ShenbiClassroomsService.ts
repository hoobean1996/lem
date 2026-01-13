/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { app__schemas__shenbi__classroom__MemberResponse } from '../models/app__schemas__shenbi__classroom__MemberResponse';
import type { AssignmentCreate } from '../models/AssignmentCreate';
import type { AssignmentResponse } from '../models/AssignmentResponse';
import type { AssignmentUpdate } from '../models/AssignmentUpdate';
import type { ClassroomCreate } from '../models/ClassroomCreate';
import type { ClassroomResponse } from '../models/ClassroomResponse';
import type { ClassroomUpdate } from '../models/ClassroomUpdate';
import type { GradebookEntry } from '../models/GradebookEntry';
import type { JoinClassroomRequest } from '../models/JoinClassroomRequest';
import type { LiveSessionEndResponse } from '../models/LiveSessionEndResponse';
import type { LiveSessionJoin } from '../models/LiveSessionJoin';
import type { LiveSessionLeaveResponse } from '../models/LiveSessionLeaveResponse';
import type { LiveSessionProgressResponse } from '../models/LiveSessionProgressResponse';
import type { LiveSessionResetResponse } from '../models/LiveSessionResetResponse';
import type { LiveSessionResponse } from '../models/LiveSessionResponse';
import type { LiveSessionSetLevel } from '../models/LiveSessionSetLevel';
import type { LiveSessionSetLevelResponse } from '../models/LiveSessionSetLevelResponse';
import type { LiveSessionStartResponse } from '../models/LiveSessionStartResponse';
import type { LiveSessionStudentResponse } from '../models/LiveSessionStudentResponse';
import type { LiveSessionUpdateProgress } from '../models/LiveSessionUpdateProgress';
import type { SubmissionGrade } from '../models/SubmissionGrade';
import type { SubmissionResponse } from '../models/SubmissionResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ShenbiClassroomsService {
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
     * Create Classroom
     * Create a new classroom (teacher only).
     * @param xApiKey
     * @param requestBody
     * @returns ClassroomResponse Successful Response
     * @throws ApiError
     */
    public static createClassroomApiV1ShenbiClassroomsPost(
        xApiKey: string,
        requestBody: ClassroomCreate,
    ): CancelablePromise<ClassroomResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/shenbi/classrooms',
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
     * List My Classrooms
     * List classrooms owned by current teacher.
     * @param xApiKey
     * @returns ClassroomResponse Successful Response
     * @throws ApiError
     */
    public static listMyClassroomsApiV1ShenbiClassroomsGet(
        xApiKey: string,
    ): CancelablePromise<Array<ClassroomResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/shenbi/classrooms',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Enrolled Classrooms
     * List classrooms current user is enrolled in.
     * @param xApiKey
     * @returns ClassroomResponse Successful Response
     * @throws ApiError
     */
    public static listEnrolledClassroomsApiV1ShenbiClassroomsEnrolledGet(
        xApiKey: string,
    ): CancelablePromise<Array<ClassroomResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/shenbi/classrooms/enrolled',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Classroom
     * Get classroom details.
     * @param classroomId
     * @param xApiKey
     * @returns ClassroomResponse Successful Response
     * @throws ApiError
     */
    public static getClassroomApiV1ShenbiClassroomsClassroomIdGet(
        classroomId: number,
        xApiKey: string,
    ): CancelablePromise<ClassroomResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/shenbi/classrooms/{classroom_id}',
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
     * Update Classroom
     * Update classroom (owner only).
     * @param classroomId
     * @param xApiKey
     * @param requestBody
     * @returns ClassroomResponse Successful Response
     * @throws ApiError
     */
    public static updateClassroomApiV1ShenbiClassroomsClassroomIdPut(
        classroomId: number,
        xApiKey: string,
        requestBody: ClassroomUpdate,
    ): CancelablePromise<ClassroomResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/shenbi/classrooms/{classroom_id}',
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
     * Delete Classroom
     * Delete classroom (owner only).
     * @param classroomId
     * @param xApiKey
     * @returns void
     * @throws ApiError
     */
    public static deleteClassroomApiV1ShenbiClassroomsClassroomIdDelete(
        classroomId: number,
        xApiKey: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/shenbi/classrooms/{classroom_id}',
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
     * Regenerate Join Code
     * Generate a new join code (owner only).
     * @param classroomId
     * @param xApiKey
     * @returns ClassroomResponse Successful Response
     * @throws ApiError
     */
    public static regenerateJoinCodeApiV1ShenbiClassroomsClassroomIdRegenerateCodePost(
        classroomId: number,
        xApiKey: string,
    ): CancelablePromise<ClassroomResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/shenbi/classrooms/{classroom_id}/regenerate-code',
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
     * Join Classroom
     * Join a classroom by code.
     * @param xApiKey
     * @param requestBody
     * @returns ClassroomResponse Successful Response
     * @throws ApiError
     */
    public static joinClassroomApiV1ShenbiClassroomsJoinPost(
        xApiKey: string,
        requestBody: JoinClassroomRequest,
    ): CancelablePromise<ClassroomResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/shenbi/classrooms/join',
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
     * Leave Classroom
     * Leave a classroom.
     * @param classroomId
     * @param xApiKey
     * @returns void
     * @throws ApiError
     */
    public static leaveClassroomApiV1ShenbiClassroomsClassroomIdLeavePost(
        classroomId: number,
        xApiKey: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/shenbi/classrooms/{classroom_id}/leave',
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
     * List Members
     * List classroom members.
     * @param classroomId
     * @param xApiKey
     * @returns app__schemas__shenbi__classroom__MemberResponse Successful Response
     * @throws ApiError
     */
    public static listMembersApiV1ShenbiClassroomsClassroomIdMembersGet(
        classroomId: number,
        xApiKey: string,
    ): CancelablePromise<Array<app__schemas__shenbi__classroom__MemberResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/shenbi/classrooms/{classroom_id}/members',
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
     * Remove Member
     * Remove a student from classroom (teacher only).
     * @param classroomId
     * @param studentId
     * @param xApiKey
     * @returns void
     * @throws ApiError
     */
    public static removeMemberApiV1ShenbiClassroomsClassroomIdMembersStudentIdDelete(
        classroomId: number,
        studentId: number,
        xApiKey: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/shenbi/classrooms/{classroom_id}/members/{student_id}',
            path: {
                'classroom_id': classroomId,
                'student_id': studentId,
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
     * Create Assignment
     * Create an assignment (teacher only).
     * @param classroomId
     * @param xApiKey
     * @param requestBody
     * @returns AssignmentResponse Successful Response
     * @throws ApiError
     */
    public static createAssignmentApiV1ShenbiClassroomsClassroomIdAssignmentsPost(
        classroomId: number,
        xApiKey: string,
        requestBody: AssignmentCreate,
    ): CancelablePromise<AssignmentResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/shenbi/classrooms/{classroom_id}/assignments',
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
     * List Assignments
     * List assignments for a classroom.
     * @param classroomId
     * @param xApiKey
     * @param includeDrafts
     * @returns AssignmentResponse Successful Response
     * @throws ApiError
     */
    public static listAssignmentsApiV1ShenbiClassroomsClassroomIdAssignmentsGet(
        classroomId: number,
        xApiKey: string,
        includeDrafts: boolean = false,
    ): CancelablePromise<Array<AssignmentResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/shenbi/classrooms/{classroom_id}/assignments',
            path: {
                'classroom_id': classroomId,
            },
            headers: {
                'X-API-Key': xApiKey,
            },
            query: {
                'include_drafts': includeDrafts,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Assignment
     * Get an assignment.
     * @param classroomId
     * @param assignmentId
     * @param xApiKey
     * @returns AssignmentResponse Successful Response
     * @throws ApiError
     */
    public static getAssignmentApiV1ShenbiClassroomsClassroomIdAssignmentsAssignmentIdGet(
        classroomId: number,
        assignmentId: number,
        xApiKey: string,
    ): CancelablePromise<AssignmentResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/shenbi/classrooms/{classroom_id}/assignments/{assignment_id}',
            path: {
                'classroom_id': classroomId,
                'assignment_id': assignmentId,
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
     * Update Assignment
     * Update an assignment (teacher only).
     * @param classroomId
     * @param assignmentId
     * @param xApiKey
     * @param requestBody
     * @returns AssignmentResponse Successful Response
     * @throws ApiError
     */
    public static updateAssignmentApiV1ShenbiClassroomsClassroomIdAssignmentsAssignmentIdPut(
        classroomId: number,
        assignmentId: number,
        xApiKey: string,
        requestBody: AssignmentUpdate,
    ): CancelablePromise<AssignmentResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/shenbi/classrooms/{classroom_id}/assignments/{assignment_id}',
            path: {
                'classroom_id': classroomId,
                'assignment_id': assignmentId,
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
     * Delete Assignment
     * Delete an assignment (teacher only).
     * @param classroomId
     * @param assignmentId
     * @param xApiKey
     * @returns void
     * @throws ApiError
     */
    public static deleteAssignmentApiV1ShenbiClassroomsClassroomIdAssignmentsAssignmentIdDelete(
        classroomId: number,
        assignmentId: number,
        xApiKey: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/shenbi/classrooms/{classroom_id}/assignments/{assignment_id}',
            path: {
                'classroom_id': classroomId,
                'assignment_id': assignmentId,
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
     * Publish Assignment
     * Publish an assignment (teacher only).
     * @param classroomId
     * @param assignmentId
     * @param xApiKey
     * @returns AssignmentResponse Successful Response
     * @throws ApiError
     */
    public static publishAssignmentApiV1ShenbiClassroomsClassroomIdAssignmentsAssignmentIdPublishPost(
        classroomId: number,
        assignmentId: number,
        xApiKey: string,
    ): CancelablePromise<AssignmentResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/shenbi/classrooms/{classroom_id}/assignments/{assignment_id}/publish',
            path: {
                'classroom_id': classroomId,
                'assignment_id': assignmentId,
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
     * List Submissions
     * List submissions for an assignment (teacher only).
     * @param classroomId
     * @param assignmentId
     * @param xApiKey
     * @returns SubmissionResponse Successful Response
     * @throws ApiError
     */
    public static listSubmissionsApiV1ShenbiClassroomsClassroomIdAssignmentsAssignmentIdSubmissionsGet(
        classroomId: number,
        assignmentId: number,
        xApiKey: string,
    ): CancelablePromise<Array<SubmissionResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/shenbi/classrooms/{classroom_id}/assignments/{assignment_id}/submissions',
            path: {
                'classroom_id': classroomId,
                'assignment_id': assignmentId,
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
     * Grade Submission
     * Grade a submission (teacher only).
     * @param classroomId
     * @param assignmentId
     * @param submissionId
     * @param xApiKey
     * @param requestBody
     * @returns SubmissionResponse Successful Response
     * @throws ApiError
     */
    public static gradeSubmissionApiV1ShenbiClassroomsClassroomIdAssignmentsAssignmentIdSubmissionsSubmissionIdPut(
        classroomId: number,
        assignmentId: number,
        submissionId: number,
        xApiKey: string,
        requestBody: SubmissionGrade,
    ): CancelablePromise<SubmissionResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/shenbi/classrooms/{classroom_id}/assignments/{assignment_id}/submissions/{submission_id}',
            path: {
                'classroom_id': classroomId,
                'assignment_id': assignmentId,
                'submission_id': submissionId,
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
     * Get Gradebook
     * Get gradebook for a classroom (teacher only).
     * @param classroomId
     * @param xApiKey
     * @returns GradebookEntry Successful Response
     * @throws ApiError
     */
    public static getGradebookApiV1ShenbiClassroomsClassroomIdGradebookGet(
        classroomId: number,
        xApiKey: string,
    ): CancelablePromise<Array<GradebookEntry>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/shenbi/classrooms/{classroom_id}/gradebook',
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
}
