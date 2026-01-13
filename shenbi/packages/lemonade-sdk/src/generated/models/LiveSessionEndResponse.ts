/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SessionSummary } from './SessionSummary';
/**
 * Response after ending session.
 */
export type LiveSessionEndResponse = {
    id: number;
    status: string;
    ended_at: string;
    summary: SessionSummary;
};

