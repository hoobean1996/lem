/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * Serve React Admin
     * Serve React admin app for client-side routing.
     * @param fullPath
     * @returns any Successful Response
     * @throws ApiError
     */
    public static serveReactAdminAdminFullPathGet(
        fullPath: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/{full_path}',
            path: {
                'full_path': fullPath,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Serve React Admin Root
     * Serve React admin app root.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static serveReactAdminRootAdminGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin',
        });
    }
    /**
     * Root
     * @returns any Successful Response
     * @throws ApiError
     */
    public static rootGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/',
        });
    }
    /**
     * Health
     * @returns any Successful Response
     * @throws ApiError
     */
    public static healthHealthGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/health',
        });
    }
}
