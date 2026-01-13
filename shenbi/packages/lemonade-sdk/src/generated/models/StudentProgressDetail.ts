/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Detailed student progress (for teacher view).
 */
export type StudentProgressDetail = {
    student_id: number;
    student_name: string;
    joined_at: string;
    stars_collected: number;
    completed: boolean;
    completed_at?: (string | null);
    last_updated_at: string;
};

