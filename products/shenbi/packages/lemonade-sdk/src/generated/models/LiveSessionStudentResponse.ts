/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PeerSummary } from './PeerSummary';
import type { StudentProgress } from './StudentProgress';
/**
 * Live session response for student (limited view).
 */
export type LiveSessionStudentResponse = {
    id: number;
    classroom_id: number;
    room_code: string;
    teacher_name: string;
    status: string;
    level?: (Record<string, any> | null);
    started_at?: (string | null);
    my_progress?: (StudentProgress | null);
    peer_summary?: (PeerSummary | null);
    created_at: string;
};

