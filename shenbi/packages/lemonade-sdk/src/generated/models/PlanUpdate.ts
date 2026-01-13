/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BillingInterval } from './BillingInterval';
export type PlanUpdate = {
    name?: (string | null);
    slug?: (string | null);
    description?: (string | null);
    price_cents?: (number | null);
    currency?: (string | null);
    billing_interval?: (BillingInterval | null);
    stripe_price_id?: (string | null);
    features?: (string | null);
    is_default?: (boolean | null);
    is_active?: (boolean | null);
};

