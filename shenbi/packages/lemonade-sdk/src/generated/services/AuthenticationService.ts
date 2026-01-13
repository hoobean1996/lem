/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { app__schemas__auth__GoogleAuthRequest } from '../models/app__schemas__auth__GoogleAuthRequest';
import type { DeviceLogin } from '../models/DeviceLogin';
import type { RefreshTokenRequest } from '../models/RefreshTokenRequest';
import type { SwitchOrgRequest } from '../models/SwitchOrgRequest';
import type { TokenResponse } from '../models/TokenResponse';
import type { TokenWithOrgResponse } from '../models/TokenWithOrgResponse';
import type { UserCreate } from '../models/UserCreate';
import type { UserLogin } from '../models/UserLogin';
import type { UserResponse } from '../models/UserResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * Signup
     * Register a new user (or enable app for existing user).
     * @param xApiKey
     * @param requestBody
     * @returns TokenResponse Successful Response
     * @throws ApiError
     */
    public static signupApiV1AuthSignupPost(
        xApiKey: string,
        requestBody: UserCreate,
    ): CancelablePromise<TokenResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/signup',
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
     * Login
     * Authenticate user with email and password.
     * @param xApiKey
     * @param requestBody
     * @returns TokenResponse Successful Response
     * @throws ApiError
     */
    public static loginApiV1AuthLoginPost(
        xApiKey: string,
        requestBody: UserLogin,
    ): CancelablePromise<TokenResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/login',
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
     * Device Login
     * Authenticate or create user by device ID (anonymous auth).
     * @param xApiKey
     * @param requestBody
     * @returns TokenResponse Successful Response
     * @throws ApiError
     */
    public static deviceLoginApiV1AuthDevicePost(
        xApiKey: string,
        requestBody: DeviceLogin,
    ): CancelablePromise<TokenResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/device',
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
     * Google Login
     * Authenticate user with Google ID token.
     *
     * Flow:
     * 1. User clicks "Sign in with Google" button in frontend
     * 2. Frontend gets Google ID token (credential) from Google Sign-In
     * 3. Frontend calls this endpoint with ID token + X-API-Key
     * 4. Backend verifies token with Google, creates/syncs user, returns our JWT
     *
     * The returned JWT can then be used with all other endpoints.
     * @param xApiKey
     * @param requestBody
     * @returns TokenResponse Successful Response
     * @throws ApiError
     */
    public static googleLoginApiV1AuthGooglePost(
        xApiKey: string,
        requestBody: app__schemas__auth__GoogleAuthRequest,
    ): CancelablePromise<TokenResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/google',
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
     * Refresh Token
     * Refresh access token using refresh token.
     * @param xApiKey
     * @param requestBody
     * @returns TokenResponse Successful Response
     * @throws ApiError
     */
    public static refreshTokenApiV1AuthRefreshPost(
        xApiKey: string,
        requestBody: RefreshTokenRequest,
    ): CancelablePromise<TokenResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/refresh',
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
     * Get Me
     * Get current authenticated user.
     * @param xApiKey
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static getMeApiV1AuthMeGet(
        xApiKey: string,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/auth/me',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Switch Organization
     * Switch to a different organization context and get new tokens.
     * @param xApiKey
     * @param requestBody
     * @returns TokenWithOrgResponse Successful Response
     * @throws ApiError
     */
    public static switchOrganizationApiV1AuthSwitchOrgPost(
        xApiKey: string,
        requestBody: SwitchOrgRequest,
    ): CancelablePromise<TokenWithOrgResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/switch-org',
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
     * Clear Organization Context
     * Clear organization context and get tokens without org.
     * @param xApiKey
     * @returns TokenResponse Successful Response
     * @throws ApiError
     */
    public static clearOrganizationContextApiV1AuthClearOrgPost(
        xApiKey: string,
    ): CancelablePromise<TokenResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/clear-org',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Revoke Token
     * Revoke tokens and sign out.
     *
     * For Google OAuth users, also revokes the Google token if provided.
     * This ensures proper sign-out as required by Google Workspace Marketplace.
     *
     * Args:
     * google_token: Optional Google access/refresh token to revoke
     * @param xApiKey
     * @param googleToken
     * @returns any Successful Response
     * @throws ApiError
     */
    public static revokeTokenApiV1AuthRevokePost(
        xApiKey: string,
        googleToken?: (string | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/revoke',
            headers: {
                'X-API-Key': xApiKey,
            },
            query: {
                'google_token': googleToken,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Check License
     * Check if the current user has a valid Google Workspace Marketplace license.
     *
     * This endpoint verifies the user's license status for paid Marketplace apps.
     * Required by Google Workspace Marketplace for apps with paid tiers.
     *
     * Returns:
     * License status including:
     * - has_license: Whether user has any license
     * - state: ACTIVE, FREE, TRIAL, EXPIRED, or UNKNOWN
     * - is_paid: Whether it's a paid license
     * - sku_id: The license SKU ID
     * - sku_name: Human-readable SKU name
     * @param xApiKey
     * @returns any Successful Response
     * @throws ApiError
     */
    public static checkLicenseApiV1AuthLicenseGet(
        xApiKey: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/auth/license',
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
