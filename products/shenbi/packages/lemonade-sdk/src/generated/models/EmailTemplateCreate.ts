/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Create a new email template.
 */
export type EmailTemplateCreate = {
    name: string;
    description?: (string | null);
    subject: string;
    body_html: string;
    body_text?: (string | null);
    variables?: (Array<string> | null);
};

