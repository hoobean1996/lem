/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_upload_file_api_v1_storage_upload_post } from '../models/Body_upload_file_api_v1_storage_upload_post';
import type { Body_upload_shared_file_api_v1_storage_upload_shared_post } from '../models/Body_upload_shared_file_api_v1_storage_upload_shared_post';
import type { DeleteResponse } from '../models/DeleteResponse';
import type { FileListResponse } from '../models/FileListResponse';
import type { FileUploadResponse } from '../models/FileUploadResponse';
import type { JsonUploadRequest } from '../models/JsonUploadRequest';
import type { SignedUrlResponse } from '../models/SignedUrlResponse';
import type { StorageStatusResponse } from '../models/StorageStatusResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StorageService {
    /**
     * Storage Status
     * Check if storage service is configured.
     * @param xApiKey
     * @returns StorageStatusResponse Successful Response
     * @throws ApiError
     */
    public static storageStatusApiV1StorageStatusGet(
        xApiKey: string,
    ): CancelablePromise<StorageStatusResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/storage/status',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Upload File
     * Upload a file to storage.
     *
     * Files are stored under: app_{app_id}/users/user_{user_id}/{folder}/{filename}
     * @param xApiKey
     * @param formData
     * @returns FileUploadResponse Successful Response
     * @throws ApiError
     */
    public static uploadFileApiV1StorageUploadPost(
        xApiKey: string,
        formData: Body_upload_file_api_v1_storage_upload_post,
    ): CancelablePromise<FileUploadResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/storage/upload',
            headers: {
                'X-API-Key': xApiKey,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Upload Shared File
     * Upload a shared file (not user-specific).
     *
     * Files are stored under: app_{app_id}/{folder}/{filename}
     * @param xApiKey
     * @param formData
     * @returns FileUploadResponse Successful Response
     * @throws ApiError
     */
    public static uploadSharedFileApiV1StorageUploadSharedPost(
        xApiKey: string,
        formData: Body_upload_shared_file_api_v1_storage_upload_shared_post,
    ): CancelablePromise<FileUploadResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/storage/upload/shared',
            headers: {
                'X-API-Key': xApiKey,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Upload Json
     * Upload JSON data as a file.
     *
     * Useful for storing configuration or structured data.
     * @param xApiKey
     * @param requestBody
     * @returns FileUploadResponse Successful Response
     * @throws ApiError
     */
    public static uploadJsonApiV1StorageUploadJsonPost(
        xApiKey: string,
        requestBody: JsonUploadRequest,
    ): CancelablePromise<FileUploadResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/storage/upload/json',
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
     * Download File
     * Download a file directly.
     *
     * Returns the file content. For large files, use /signed-url instead.
     * @param path Full path to the file
     * @param xApiKey
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadFileApiV1StorageDownloadGet(
        path: string,
        xApiKey: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/storage/download',
            headers: {
                'X-API-Key': xApiKey,
            },
            query: {
                'path': path,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Download Json
     * Download and parse a JSON file.
     *
     * Returns the JSON content as an object.
     * @param path Full path to the JSON file
     * @param xApiKey
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadJsonApiV1StorageDownloadJsonGet(
        path: string,
        xApiKey: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/storage/download/json',
            headers: {
                'X-API-Key': xApiKey,
            },
            query: {
                'path': path,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Signed Url
     * Get a signed URL for secure, time-limited file access.
     *
     * Use this for large files or when you need to provide direct access.
     * @param path Full path to the file
     * @param xApiKey
     * @param expiresIn URL validity in minutes
     * @returns SignedUrlResponse Successful Response
     * @throws ApiError
     */
    public static getSignedUrlApiV1StorageSignedUrlGet(
        path: string,
        xApiKey: string,
        expiresIn: number = 60,
    ): CancelablePromise<SignedUrlResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/storage/signed-url',
            headers: {
                'X-API-Key': xApiKey,
            },
            query: {
                'path': path,
                'expires_in': expiresIn,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List User Files
     * List files in the current user's storage.
     * @param xApiKey
     * @param folder Folder to list
     * @param prefix Filter by prefix
     * @returns FileListResponse Successful Response
     * @throws ApiError
     */
    public static listUserFilesApiV1StorageFilesGet(
        xApiKey: string,
        folder: string = 'files',
        prefix?: (string | null),
    ): CancelablePromise<FileListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/storage/files',
            headers: {
                'X-API-Key': xApiKey,
            },
            query: {
                'folder': folder,
                'prefix': prefix,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Shared Files
     * List shared files (app-wide, not user-specific).
     * @param xApiKey
     * @param folder Folder to list
     * @param prefix Filter by prefix
     * @returns FileListResponse Successful Response
     * @throws ApiError
     */
    public static listSharedFilesApiV1StorageFilesSharedGet(
        xApiKey: string,
        folder: string = 'shared',
        prefix?: (string | null),
    ): CancelablePromise<FileListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/storage/files/shared',
            headers: {
                'X-API-Key': xApiKey,
            },
            query: {
                'folder': folder,
                'prefix': prefix,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete File
     * Delete a file from storage.
     * @param path Full path to the file
     * @param xApiKey
     * @returns DeleteResponse Successful Response
     * @throws ApiError
     */
    public static deleteFileApiV1StorageFileDelete(
        path: string,
        xApiKey: string,
    ): CancelablePromise<DeleteResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/storage/file',
            headers: {
                'X-API-Key': xApiKey,
            },
            query: {
                'path': path,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
