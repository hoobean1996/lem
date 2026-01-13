/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BillingInterval } from './BillingInterval';
export type PlanCreate = {
    name: string;
    slug: string;
    description?: (string | null);
    price_cents?: number;
    currency?: string;
    billing_interval?: BillingInterval;
    stripe_price_id?: (string | null);
    features?: (string | null);
    is_default?: boolean;
};

