/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response after marking completion.
 */
export type BattleCompleteResponse = {
    id: number;
    room_code: string;
    status: string;
    host_completed: boolean;
    host_completed_at: (string | null);
    guest_completed: boolean;
    guest_completed_at: (string | null);
    winner_id: (number | null);
    winner_name: (string | null);
};

