/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { app__schemas__email__SendTemplateEmailRequest } from '../models/app__schemas__email__SendTemplateEmailRequest';
import type { EmailPreviewRequest } from '../models/EmailPreviewRequest';
import type { EmailPreviewResponse } from '../models/EmailPreviewResponse';
import type { EmailResponse } from '../models/EmailResponse';
import type { EmailTemplateCreate } from '../models/EmailTemplateCreate';
import type { EmailTemplateResponse } from '../models/EmailTemplateResponse';
import type { EmailTemplateUpdate } from '../models/EmailTemplateUpdate';
import type { SendEmailRequest } from '../models/SendEmailRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class EmailService {
    /**
     * List Templates
     * List all email templates for the current app.
     * @param xApiKey
     * @returns EmailTemplateResponse Successful Response
     * @throws ApiError
     */
    public static listTemplatesApiV1EmailTemplatesGet(
        xApiKey: string,
    ): CancelablePromise<Array<EmailTemplateResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/email/templates',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Template
     * Create a new email template.
     * @param xApiKey
     * @param requestBody
     * @returns EmailTemplateResponse Successful Response
     * @throws ApiError
     */
    public static createTemplateApiV1EmailTemplatesPost(
        xApiKey: string,
        requestBody: EmailTemplateCreate,
    ): CancelablePromise<EmailTemplateResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/email/templates',
            headers: {
                'X-API-Key': xApiKey,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Template
     * Get a specific email template by ID.
     * @param templateId
     * @param xApiKey
     * @returns EmailTemplateResponse Successful Response
     * @throws ApiError
     */
    public static getTemplateApiV1EmailTemplatesTemplateIdGet(
        templateId: number,
        xApiKey: string,
    ): CancelablePromise<EmailTemplateResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/email/templates/{template_id}',
            path: {
                'template_id': templateId,
            },
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Template
     * Update an email template.
     * @param templateId
     * @param xApiKey
     * @param requestBody
     * @returns EmailTemplateResponse Successful Response
     * @throws ApiError
     */
    public static updateTemplateApiV1EmailTemplatesTemplateIdPut(
        templateId: number,
        xApiKey: string,
        requestBody: EmailTemplateUpdate,
    ): CancelablePromise<EmailTemplateResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/email/templates/{template_id}',
            path: {
                'template_id': templateId,
            },
            headers: {
                'X-API-Key': xApiKey,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Template
     * Delete an email template.
     * @param templateId
     * @param xApiKey
     * @returns void
     * @throws ApiError
     */
    public static deleteTemplateApiV1EmailTemplatesTemplateIdDelete(
        templateId: number,
        xApiKey: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/email/templates/{template_id}',
            path: {
                'template_id': templateId,
            },
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Send Email
     * Send a custom email (not using template).
     *
     * Requires authentication. Sends email to specified recipient(s).
     * @param xApiKey
     * @param requestBody
     * @returns EmailResponse Successful Response
     * @throws ApiError
     */
    public static sendEmailApiV1EmailSendPost(
        xApiKey: string,
        requestBody: SendEmailRequest,
    ): CancelablePromise<EmailResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/email/send',
            headers: {
                'X-API-Key': xApiKey,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Send Template Email
     * Send an email using a database template.
     *
     * Templates are created via the /email/templates endpoints.
     * Use {{variable}} syntax in templates for dynamic content.
     * @param xApiKey
     * @param requestBody
     * @returns EmailResponse Successful Response
     * @throws ApiError
     */
    public static sendTemplateEmailApiV1EmailSendTemplatePost(
        xApiKey: string,
        requestBody: app__schemas__email__SendTemplateEmailRequest,
    ): CancelablePromise<EmailResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/email/send-template',
            headers: {
                'X-API-Key': xApiKey,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Preview Template
     * Preview a template with variables substituted.
     *
     * Returns the rendered subject, body_html, and body_text without sending.
     * @param xApiKey
     * @param requestBody
     * @returns EmailPreviewResponse Successful Response
     * @throws ApiError
     */
    public static previewTemplateApiV1EmailPreviewPost(
        xApiKey: string,
        requestBody: EmailPreviewRequest,
    ): CancelablePromise<EmailPreviewResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/email/preview',
            headers: {
                'X-API-Key': xApiKey,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Email Status
     * Check if email service is configured.
     * @param xApiKey
     * @returns EmailResponse Successful Response
     * @throws ApiError
     */
    public static emailStatusApiV1EmailStatusGet(
        xApiKey: string,
    ): CancelablePromise<EmailResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/email/status',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
