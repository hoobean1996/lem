/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Includes subscription and member info for owners/admins.
 */
export type OrganizationDetailResponse = {
    id: number;
    app_id: number;
    name: string;
    slug: string;
    description: (string | null);
    logo_url: (string | null);
    is_active: boolean;
    created_at: string;
    member_count?: number;
    has_active_subscription?: boolean;
    current_plan_name?: (string | null);
};

