/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Schema for a Google Drive file.
 */
export type DriveFileSchema = {
    id: string;
    name: string;
    mime_type: string;
    size?: (string | null);
    created_time?: (string | null);
    modified_time?: (string | null);
    parents?: Array<string>;
    web_view_link?: (string | null);
    icon_link?: (string | null);
    thumbnail_link?: (string | null);
    shared?: boolean;
};

