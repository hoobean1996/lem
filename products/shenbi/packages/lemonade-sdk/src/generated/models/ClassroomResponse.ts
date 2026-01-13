/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ClassroomResponse = {
    id: number;
    app_id: number;
    teacher_id: number;
    name: string;
    description: (string | null);
    join_code: string;
    is_active: boolean;
    allow_join: boolean;
    active_room_code: (string | null);
    member_count?: number;
    created_at: string;
};

