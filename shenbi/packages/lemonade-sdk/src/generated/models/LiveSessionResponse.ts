/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SessionSummary } from './SessionSummary';
import type { StudentProgressDetail } from './StudentProgressDetail';
/**
 * Full live session response (for teacher).
 */
export type LiveSessionResponse = {
    id: number;
    classroom_id: number;
    room_code: string;
    teacher_id: number;
    teacher_name: string;
    status: string;
    level?: (Record<string, any> | null);
    started_at?: (string | null);
    students?: Array<StudentProgressDetail>;
    summary?: (SessionSummary | null);
    created_at: string;
    expires_at: string;
};

