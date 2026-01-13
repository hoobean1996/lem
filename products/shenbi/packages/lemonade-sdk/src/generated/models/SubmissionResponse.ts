/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SubmissionResponse = {
    id: number;
    assignment_id: number;
    student_id: number;
    levels_completed: number;
    total_levels: number;
    total_stars: number;
    grade_percentage: (number | null);
    manual_grade: (number | null);
    teacher_notes: (string | null);
    submitted_at: (string | null);
    graded_at: (string | null);
    final_grade?: (number | null);
    display_name?: (string | null);
};

