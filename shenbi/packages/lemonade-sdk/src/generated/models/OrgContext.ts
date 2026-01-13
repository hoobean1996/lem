/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrgRole } from './OrgRole';
/**
 * Organization context returned with auth.
 */
export type OrgContext = {
    organization_id: number;
    organization_name: string;
    role: OrgRole;
};

