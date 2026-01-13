/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DriveFileSchema } from './DriveFileSchema';
/**
 * Response for file listing.
 */
export type DriveFileListResponse = {
    files: Array<DriveFileSchema>;
    next_page_token?: (string | null);
};

