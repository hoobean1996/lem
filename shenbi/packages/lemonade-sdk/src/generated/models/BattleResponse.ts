/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Full battle room response.
 */
export type BattleResponse = {
    id: number;
    room_code: string;
    host_id: number;
    host_name: string;
    guest_id: (number | null);
    guest_name: (string | null);
    status: string;
    level?: (Record<string, any> | null);
    host_completed: boolean;
    host_completed_at?: (string | null);
    guest_completed: boolean;
    guest_completed_at?: (string | null);
    winner_id: (number | null);
    winner_name?: (string | null);
    started_at?: (string | null);
    created_at: string;
    expires_at: string;
};

