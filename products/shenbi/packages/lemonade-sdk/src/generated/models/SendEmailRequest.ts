/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request to send a custom email (not using template).
 */
export type SendEmailRequest = {
    to: (string | Array<string>);
    subject: string;
    body_html: string;
    body_text?: (string | null);
};

