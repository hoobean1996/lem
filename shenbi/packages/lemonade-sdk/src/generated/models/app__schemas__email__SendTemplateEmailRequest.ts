/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request to send a templated email.
 */
export type app__schemas__email__SendTemplateEmailRequest = {
    to: string;
    template_name: string;
    variables?: (Record<string, any> | null);
};

