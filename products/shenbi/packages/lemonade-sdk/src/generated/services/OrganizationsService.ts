/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CheckoutSessionResponse } from '../models/CheckoutSessionResponse';
import type { InvitationAccept } from '../models/InvitationAccept';
import type { InvitationCreate } from '../models/InvitationCreate';
import type { InvitationResponse } from '../models/InvitationResponse';
import type { MemberResponse } from '../models/MemberResponse';
import type { MemberRoleUpdate } from '../models/MemberRoleUpdate';
import type { OrganizationCreate } from '../models/OrganizationCreate';
import type { OrganizationDetailResponse } from '../models/OrganizationDetailResponse';
import type { OrganizationResponse } from '../models/OrganizationResponse';
import type { OrganizationUpdate } from '../models/OrganizationUpdate';
import type { PortalSessionResponse } from '../models/PortalSessionResponse';
import type { UserOrganizationsResponse } from '../models/UserOrganizationsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrganizationsService {
    /**
     * Create Organization
     * Create a new organization (user becomes owner).
     * @param xApiKey
     * @param requestBody
     * @returns OrganizationResponse Successful Response
     * @throws ApiError
     */
    public static createOrganizationApiV1OrganizationsPost(
        xApiKey: string,
        requestBody: OrganizationCreate,
    ): CancelablePromise<OrganizationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/organizations',
            headers: {
                'X-API-Key': xApiKey,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List My Organizations
     * List all organizations the current user belongs to.
     * @param xApiKey
     * @returns UserOrganizationsResponse Successful Response
     * @throws ApiError
     */
    public static listMyOrganizationsApiV1OrganizationsGet(
        xApiKey: string,
    ): CancelablePromise<UserOrganizationsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/organizations',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Current Organization
     * Get details of the currently selected organization.
     * @param xApiKey
     * @returns OrganizationDetailResponse Successful Response
     * @throws ApiError
     */
    public static getCurrentOrganizationApiV1OrganizationsCurrentGet(
        xApiKey: string,
    ): CancelablePromise<OrganizationDetailResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/organizations/current',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Organization
     * Update organization (admin/owner only).
     * @param xApiKey
     * @param requestBody
     * @returns OrganizationResponse Successful Response
     * @throws ApiError
     */
    public static updateOrganizationApiV1OrganizationsCurrentPatch(
        xApiKey: string,
        requestBody: OrganizationUpdate,
    ): CancelablePromise<OrganizationResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/organizations/current',
            headers: {
                'X-API-Key': xApiKey,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Organization
     * Delete organization (owner only).
     * @param xApiKey
     * @returns void
     * @throws ApiError
     */
    public static deleteOrganizationApiV1OrganizationsCurrentDelete(
        xApiKey: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/organizations/current',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Members
     * List all members of the organization.
     * @param xApiKey
     * @returns MemberResponse Successful Response
     * @throws ApiError
     */
    public static listMembersApiV1OrganizationsCurrentMembersGet(
        xApiKey: string,
    ): CancelablePromise<Array<MemberResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/organizations/current/members',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Member Role
     * Update a member's role (admin/owner only).
     * @param userId
     * @param xApiKey
     * @param requestBody
     * @returns MemberResponse Successful Response
     * @throws ApiError
     */
    public static updateMemberRoleApiV1OrganizationsCurrentMembersUserIdPatch(
        userId: number,
        xApiKey: string,
        requestBody: MemberRoleUpdate,
    ): CancelablePromise<MemberResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/organizations/current/members/{user_id}',
            path: {
                'user_id': userId,
            },
            headers: {
                'X-API-Key': xApiKey,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Remove Member
     * Remove a member (admin/owner only).
     * @param userId
     * @param xApiKey
     * @returns void
     * @throws ApiError
     */
    public static removeMemberApiV1OrganizationsCurrentMembersUserIdDelete(
        userId: number,
        xApiKey: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/organizations/current/members/{user_id}',
            path: {
                'user_id': userId,
            },
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Leave Organization
     * Leave the organization.
     * @param xApiKey
     * @returns void
     * @throws ApiError
     */
    public static leaveOrganizationApiV1OrganizationsCurrentLeavePost(
        xApiKey: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/organizations/current/leave',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Invitation
     * Create an invitation (admin/owner only).
     * @param xApiKey
     * @param requestBody
     * @returns InvitationResponse Successful Response
     * @throws ApiError
     */
    public static createInvitationApiV1OrganizationsCurrentInvitationsPost(
        xApiKey: string,
        requestBody: InvitationCreate,
    ): CancelablePromise<InvitationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/organizations/current/invitations',
            headers: {
                'X-API-Key': xApiKey,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Invitations
     * List pending invitations (admin/owner only).
     * @param xApiKey
     * @returns InvitationResponse Successful Response
     * @throws ApiError
     */
    public static listInvitationsApiV1OrganizationsCurrentInvitationsGet(
        xApiKey: string,
    ): CancelablePromise<Array<InvitationResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/organizations/current/invitations',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Revoke Invitation
     * Revoke an invitation (admin/owner only).
     * @param invitationId
     * @param xApiKey
     * @returns void
     * @throws ApiError
     */
    public static revokeInvitationApiV1OrganizationsCurrentInvitationsInvitationIdDelete(
        invitationId: number,
        xApiKey: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/organizations/current/invitations/{invitation_id}',
            path: {
                'invitation_id': invitationId,
            },
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Accept Invitation
     * Accept an invitation using the token.
     * @param xApiKey
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static acceptInvitationApiV1OrganizationsAcceptInvitationPost(
        xApiKey: string,
        requestBody: InvitationAccept,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/organizations/accept-invitation',
            headers: {
                'X-API-Key': xApiKey,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Org Checkout
     * Create Stripe checkout for org subscription (owner only).
     * @param planId
     * @param successUrl
     * @param cancelUrl
     * @param xApiKey
     * @returns CheckoutSessionResponse Successful Response
     * @throws ApiError
     */
    public static createOrgCheckoutApiV1OrganizationsCurrentCheckoutPost(
        planId: number,
        successUrl: string,
        cancelUrl: string,
        xApiKey: string,
    ): CancelablePromise<CheckoutSessionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/organizations/current/checkout',
            headers: {
                'X-API-Key': xApiKey,
            },
            query: {
                'plan_id': planId,
                'success_url': successUrl,
                'cancel_url': cancelUrl,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Org Portal
     * Create Stripe billing portal for org (owner only).
     * @param returnUrl
     * @param xApiKey
     * @returns PortalSessionResponse Successful Response
     * @throws ApiError
     */
    public static createOrgPortalApiV1OrganizationsCurrentPortalPost(
        returnUrl: string,
        xApiKey: string,
    ): CancelablePromise<PortalSessionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/organizations/current/portal',
            headers: {
                'X-API-Key': xApiKey,
            },
            query: {
                'return_url': returnUrl,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Org Subscription
     * Get organization's current subscription.
     * @param xApiKey
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getOrgSubscriptionApiV1OrganizationsCurrentSubscriptionGet(
        xApiKey: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/organizations/current/subscription',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
