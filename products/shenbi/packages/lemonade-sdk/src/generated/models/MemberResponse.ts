/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrgRole } from './OrgRole';
export type MemberResponse = {
    id: number;
    user_id: number;
    role: OrgRole;
    joined_at: string;
    user_email?: (string | null);
    user_name?: (string | null);
};

