/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PlanResponse } from './PlanResponse';
import type { SubscriptionStatus } from './SubscriptionStatus';
export type SubscriptionResponse = {
    id: number;
    user_id: (number | null);
    organization_id: (number | null);
    plan_id: number;
    status: SubscriptionStatus;
    stripe_subscription_id: (string | null);
    current_period_start: (string | null);
    current_period_end: (string | null);
    canceled_at: (string | null);
    trial_end: (string | null);
    created_at: string;
    plan?: (PlanResponse | null);
};

