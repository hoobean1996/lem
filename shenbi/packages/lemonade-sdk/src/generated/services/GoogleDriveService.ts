/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DriveAuthUrlResponse } from '../models/DriveAuthUrlResponse';
import type { DriveFileListResponse } from '../models/DriveFileListResponse';
import type { DriveStatusResponse } from '../models/DriveStatusResponse';
import type { ExportFileRequest } from '../models/ExportFileRequest';
import type { ShareFileRequest } from '../models/ShareFileRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GoogleDriveService {
    /**
     * Drive Status
     * Check if user has connected Google Drive.
     * @param xApiKey
     * @returns DriveStatusResponse Successful Response
     * @throws ApiError
     */
    public static driveStatusApiV1DriveStatusGet(
        xApiKey: string,
    ): CancelablePromise<DriveStatusResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/drive/status',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Auth Url
     * Get Google OAuth authorization URL for connecting Drive.
     *
     * The user should be redirected to this URL to grant Drive access.
     * After authorization, Google will redirect to the callback endpoint.
     * @param xApiKey
     * @param redirectUri Custom redirect URI
     * @returns DriveAuthUrlResponse Successful Response
     * @throws ApiError
     */
    public static getAuthUrlApiV1DriveAuthUrlGet(
        xApiKey: string,
        redirectUri?: (string | null),
    ): CancelablePromise<DriveAuthUrlResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/drive/auth-url',
            headers: {
                'X-API-Key': xApiKey,
            },
            query: {
                'redirect_uri': redirectUri,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Oauth Callback
     * OAuth callback endpoint - receives authorization code from Google.
     *
     * This endpoint is called by Google after user grants permission.
     * It exchanges the code for tokens and stores them.
     * @param code Authorization code from Google
     * @param state State parameter (user ID)
     * @param error Error from Google
     * @returns any Successful Response
     * @throws ApiError
     */
    public static oauthCallbackApiV1DriveCallbackGet(
        code: string,
        state?: (string | null),
        error?: (string | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/drive/callback',
            query: {
                'code': code,
                'state': state,
                'error': error,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Disconnect Drive
     * Disconnect Google Drive (remove stored tokens).
     * @param xApiKey
     * @returns any Successful Response
     * @throws ApiError
     */
    public static disconnectDriveApiV1DriveDisconnectPost(
        xApiKey: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/drive/disconnect',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Files
     * List files in user's Google Drive.
     *
     * Common MIME types:
     * - application/vnd.google-apps.folder (folders)
     * - application/vnd.google-apps.document (Google Docs)
     * - application/vnd.google-apps.spreadsheet (Google Sheets)
     * - application/vnd.google-apps.presentation (Google Slides)
     * @param xApiKey
     * @param pageSize
     * @param pageToken
     * @param folderId Folder ID (use 'root' for root)
     * @param mimeType Filter by MIME type
     * @returns DriveFileListResponse Successful Response
     * @throws ApiError
     */
    public static listFilesApiV1DriveFilesGet(
        xApiKey: string,
        pageSize: number = 20,
        pageToken?: (string | null),
        folderId?: (string | null),
        mimeType?: (string | null),
    ): CancelablePromise<DriveFileListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/drive/files',
            headers: {
                'X-API-Key': xApiKey,
            },
            query: {
                'page_size': pageSize,
                'page_token': pageToken,
                'folder_id': folderId,
                'mime_type': mimeType,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get File
     * Get metadata for a specific file.
     * @param fileId
     * @param xApiKey
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getFileApiV1DriveFilesFileIdGet(
        fileId: string,
        xApiKey: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/drive/files/{file_id}',
            path: {
                'file_id': fileId,
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
     * Search Files
     * Search for files by name.
     * @param q Search query
     * @param xApiKey
     * @param pageSize
     * @param pageToken
     * @returns any Successful Response
     * @throws ApiError
     */
    public static searchFilesApiV1DriveSearchGet(
        q: string,
        xApiKey: string,
        pageSize: number = 20,
        pageToken?: (string | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/drive/search',
            headers: {
                'X-API-Key': xApiKey,
            },
            query: {
                'q': q,
                'page_size': pageSize,
                'page_token': pageToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Export File
     * Export a Google Workspace file to another format.
     *
     * Available formats:
     * - Google Docs: pdf, docx, txt, html
     * - Google Sheets: pdf, xlsx, csv
     * - Google Slides: pdf, pptx
     * @param fileId
     * @param xApiKey
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static exportFileApiV1DriveFilesFileIdExportPost(
        fileId: string,
        xApiKey: string,
        requestBody: ExportFileRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/drive/files/{file_id}/export',
            path: {
                'file_id': fileId,
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
     * Share File
     * Share a file with another user.
     *
     * Roles:
     * - reader: Can view
     * - commenter: Can view and comment
     * - writer: Can view, comment, and edit
     * @param fileId
     * @param xApiKey
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static shareFileApiV1DriveFilesFileIdSharePost(
        fileId: string,
        xApiKey: string,
        requestBody: ShareFileRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/drive/files/{file_id}/share',
            path: {
                'file_id': fileId,
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
     * List Folders
     * List folders in a specific folder (default: root).
     * @param xApiKey
     * @param folderId Parent folder ID
     * @param pageSize
     * @param pageToken
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listFoldersApiV1DriveFoldersGet(
        xApiKey: string,
        folderId?: (string | null),
        pageSize: number = 20,
        pageToken?: (string | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/drive/folders',
            headers: {
                'X-API-Key': xApiKey,
            },
            query: {
                'folder_id': folderId,
                'page_size': pageSize,
                'page_token': pageToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Documents
     * List all Google Docs.
     * @param xApiKey
     * @param pageSize
     * @param pageToken
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listDocumentsApiV1DriveDocumentsGet(
        xApiKey: string,
        pageSize: number = 20,
        pageToken?: (string | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/drive/documents',
            headers: {
                'X-API-Key': xApiKey,
            },
            query: {
                'page_size': pageSize,
                'page_token': pageToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Spreadsheets
     * List all Google Sheets.
     * @param xApiKey
     * @param pageSize
     * @param pageToken
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listSpreadsheetsApiV1DriveSpreadsheetsGet(
        xApiKey: string,
        pageSize: number = 20,
        pageToken?: (string | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/drive/spreadsheets',
            headers: {
                'X-API-Key': xApiKey,
            },
            query: {
                'page_size': pageSize,
                'page_token': pageToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Presentations
     * List all Google Slides.
     * @param xApiKey
     * @param pageSize
     * @param pageToken
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listPresentationsApiV1DrivePresentationsGet(
        xApiKey: string,
        pageSize: number = 20,
        pageToken?: (string | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/drive/presentations',
            headers: {
                'X-API-Key': xApiKey,
            },
            query: {
                'page_size': pageSize,
                'page_token': pageToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
