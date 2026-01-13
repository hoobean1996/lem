/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InvitationStatus } from './InvitationStatus';
import type { OrgRole } from './OrgRole';
export type InvitationResponse = {
    id: number;
    email: string;
    role: OrgRole;
    status: InvitationStatus;
    token: string;
    created_at: string;
    expires_at: string;
    invited_by_email?: (string | null);
};

