/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Email template response.
 */
export type EmailTemplateResponse = {
    id: number;
    app_id: number;
    name: string;
    description: (string | null);
    subject: string;
    body_html: string;
    body_text: (string | null);
    variables: (Array<string> | null);
    created_at: string;
    updated_at: string;
};

