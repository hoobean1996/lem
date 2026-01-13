/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StudentProgressDetail } from './StudentProgressDetail';
/**
 * Response after resetting session.
 */
export type LiveSessionResetResponse = {
    id: number;
    status: string;
    started_at: (string | null);
    students: Array<StudentProgressDetail>;
};

