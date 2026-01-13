/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CheckoutSessionResponse } from '../models/CheckoutSessionResponse';
import type { PlanResponse } from '../models/PlanResponse';
import type { PortalSessionResponse } from '../models/PortalSessionResponse';
import type { SubscriptionResponse } from '../models/SubscriptionResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SubscriptionsService {
    /**
     * List Plans
     * List all available plans for the app.
     * @param xApiKey
     * @returns PlanResponse Successful Response
     * @throws ApiError
     */
    public static listPlansApiV1SubscriptionsPlansGet(
        xApiKey: string,
    ): CancelablePromise<Array<PlanResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/subscriptions/plans',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Current Subscription
     * Get the current user's active subscription for this app.
     * @param xApiKey
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getCurrentSubscriptionApiV1SubscriptionsCurrentGet(
        xApiKey: string,
    ): CancelablePromise<(SubscriptionResponse | null)> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/subscriptions/current',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Checkout
     * Create a Stripe Checkout session for a plan.
     * @param planId
     * @param successUrl
     * @param cancelUrl
     * @param xApiKey
     * @returns CheckoutSessionResponse Successful Response
     * @throws ApiError
     */
    public static createCheckoutApiV1SubscriptionsCheckoutPost(
        planId: number,
        successUrl: string,
        cancelUrl: string,
        xApiKey: string,
    ): CancelablePromise<CheckoutSessionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/subscriptions/checkout',
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
     * Create Portal
     * Create a Stripe Customer Portal session.
     * @param returnUrl
     * @param xApiKey
     * @returns PortalSessionResponse Successful Response
     * @throws ApiError
     */
    public static createPortalApiV1SubscriptionsPortalPost(
        returnUrl: string,
        xApiKey: string,
    ): CancelablePromise<PortalSessionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/subscriptions/portal',
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
     * Stripe Webhook
     * Handle Stripe webhook events.
     * @param stripeSignature
     * @returns any Successful Response
     * @throws ApiError
     */
    public static stripeWebhookApiV1SubscriptionsWebhookPost(
        stripeSignature: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/subscriptions/webhook',
            headers: {
                'Stripe-Signature': stripeSignature,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
