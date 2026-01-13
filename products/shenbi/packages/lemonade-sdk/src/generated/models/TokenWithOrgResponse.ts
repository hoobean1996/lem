/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrgContextInToken } from './OrgContextInToken';
import type { UserResponse } from './UserResponse';
/**
 * Token response with organization context.
 */
export type TokenWithOrgResponse = {
    access_token: string;
    refresh_token: string;
    token_type?: string;
    expires_in: number;
    user: UserResponse;
    organization?: (OrgContextInToken | null);
    organizations?: Array<OrgContextInToken>;
};

