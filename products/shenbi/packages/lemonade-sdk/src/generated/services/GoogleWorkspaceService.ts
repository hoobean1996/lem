/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GoogleWorkspaceService {
    /**
     * Get Document
     * Get a Google Doc's full content structure.
     *
     * Returns the raw document structure from Google Docs API.
     * @param documentId
     * @param xApiKey
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getDocumentApiV1WorkspaceDocsDocumentIdGet(
        documentId: string,
        xApiKey: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/workspace/docs/{document_id}',
            path: {
                'document_id': documentId,
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
     * Get Document Text
     * Get a Google Doc's content as plain text.
     *
     * Extracts all text content from the document.
     * @param documentId
     * @param xApiKey
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getDocumentTextApiV1WorkspaceDocsDocumentIdTextGet(
        documentId: string,
        xApiKey: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/workspace/docs/{document_id}/text',
            path: {
                'document_id': documentId,
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
     * Get Document Structure
     * Get a Google Doc's structure (headings, paragraphs, tables).
     *
     * Returns a simplified structure with element types.
     * @param documentId
     * @param xApiKey
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getDocumentStructureApiV1WorkspaceDocsDocumentIdStructureGet(
        documentId: string,
        xApiKey: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/workspace/docs/{document_id}/structure',
            path: {
                'document_id': documentId,
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
     * Get Spreadsheet
     * Get spreadsheet metadata (title, sheets list).
     * @param spreadsheetId
     * @param xApiKey
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getSpreadsheetApiV1WorkspaceSheetsSpreadsheetIdGet(
        spreadsheetId: string,
        xApiKey: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/workspace/sheets/{spreadsheet_id}',
            path: {
                'spreadsheet_id': spreadsheetId,
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
     * Get Sheet Values
     * Get cell values from a spreadsheet range.
     *
     * Examples:
     * - "Sheet1" - All data from Sheet1
     * - "Sheet1!A1:D10" - Specific range
     * - "A1:D10" - Range in first sheet
     * @param spreadsheetId
     * @param xApiKey
     * @param range A1 notation range (e.g., Sheet1!A1:D10)
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getSheetValuesApiV1WorkspaceSheetsSpreadsheetIdValuesGet(
        spreadsheetId: string,
        xApiKey: string,
        range: string = 'Sheet1',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/workspace/sheets/{spreadsheet_id}/values',
            path: {
                'spreadsheet_id': spreadsheetId,
            },
            headers: {
                'X-API-Key': xApiKey,
            },
            query: {
                'range': range,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Sheet Values Batch
     * Get values from multiple ranges at once.
     *
     * Pass a list of A1 notation ranges.
     * @param spreadsheetId
     * @param xApiKey
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getSheetValuesBatchApiV1WorkspaceSheetsSpreadsheetIdValuesBatchPost(
        spreadsheetId: string,
        xApiKey: string,
        requestBody: Array<string>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/workspace/sheets/{spreadsheet_id}/values/batch',
            path: {
                'spreadsheet_id': spreadsheetId,
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
     * Get Presentation
     * Get presentation full content.
     *
     * Returns the raw presentation structure from Google Slides API.
     * @param presentationId
     * @param xApiKey
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getPresentationApiV1WorkspaceSlidesPresentationIdGet(
        presentationId: string,
        xApiKey: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/workspace/slides/{presentation_id}',
            path: {
                'presentation_id': presentationId,
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
     * Get Presentation Summary
     * Get presentation summary (title, slide count, slide titles).
     * @param presentationId
     * @param xApiKey
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getPresentationSummaryApiV1WorkspaceSlidesPresentationIdSummaryGet(
        presentationId: string,
        xApiKey: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/workspace/slides/{presentation_id}/summary',
            path: {
                'presentation_id': presentationId,
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
     * Get Slide
     * Get a specific slide's content.
     *
     * slide_index is zero-based (first slide = 0).
     * @param presentationId
     * @param slideIndex
     * @param xApiKey
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getSlideApiV1WorkspaceSlidesPresentationIdSlideSlideIndexGet(
        presentationId: string,
        slideIndex: number,
        xApiKey: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/workspace/slides/{presentation_id}/slide/{slide_index}',
            path: {
                'presentation_id': presentationId,
                'slide_index': slideIndex,
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
     * Get Presentation Text
     * Get all text content from a presentation.
     *
     * Returns text organized by slide.
     * @param presentationId
     * @param xApiKey
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getPresentationTextApiV1WorkspaceSlidesPresentationIdTextGet(
        presentationId: string,
        xApiKey: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/workspace/slides/{presentation_id}/text',
            path: {
                'presentation_id': presentationId,
            },
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
