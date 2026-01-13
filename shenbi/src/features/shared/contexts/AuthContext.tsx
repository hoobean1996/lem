/**
 * Authentication Context with Google Login
 *
 * Uses @lemonade/sdk for authentication via Google OAuth.
 * Tokens are stored in localStorage for persistence.
 */

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { LemonadeClient, ApiError } from '@lemonade/sdk';
import type { UserResponse, TokenResponse } from '@lemonade/sdk';

// Storage keys
const ACCESS_TOKEN_KEY = 'shenbi_access_token';
const REFRESH_TOKEN_KEY = 'shenbi_refresh_token';
const USER_KEY = 'shenbi_user';

// API configuration
const LEMONADE_API_KEY = 'z68ZMnlBRMkzTWd5gqLaAmv4TR8Q2nE1wu3DjLKVFHM';
// Use same origin when served by Go backend
const LEMONADE_BASE_URL = window.location.origin;

// Google OAuth Client ID
export const GOOGLE_CLIENT_ID = '903028288904-j39mh2o9mjj0f8mk43mgb1uu38toh2on.apps.googleusercontent.com';

// Create a singleton lemon client
const lemonClient = new LemonadeClient({
  apiKey: LEMONADE_API_KEY,
  baseUrl: LEMONADE_BASE_URL,
});

interface AuthContextType {
  user: UserResponse | null;
  accessToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Get stored tokens from localStorage
 */
function getStoredTokens(): { accessToken: string | null; refreshToken: string | null } {
  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

/**
 * Get stored user from localStorage
 */
function getStoredUser(): UserResponse | null {
  const userJson = localStorage.getItem(USER_KEY);
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Store tokens in localStorage
 */
function storeTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Store user in localStorage
 */
function storeUser(user: UserResponse): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Clear all auth data from localStorage
 */
function clearStoredAuth(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Handle successful authentication
   */
  const handleAuthSuccess = useCallback((tokens: TokenResponse) => {
    setAccessToken(tokens.access_token);
    setUser(tokens.user);
    storeTokens(tokens.access_token, tokens.refresh_token);
    storeUser(tokens.user);
    lemonClient.setAccessToken(tokens.access_token);
  }, []);

  /**
   * Refresh access token using refresh token
   */
  const refreshAuth = useCallback(async (): Promise<boolean> => {
    const { refreshToken } = getStoredTokens();
    if (!refreshToken) {
      return false;
    }

    try {
      const tokens = await lemonClient.auth.refresh({ refresh_token: refreshToken });
      handleAuthSuccess(tokens);
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      clearStoredAuth();
      setUser(null);
      setAccessToken(null);
      lemonClient.clearAccessToken();
      return false;
    }
  }, [handleAuthSuccess]);

  /**
   * Login with Google ID token
   */
  const loginWithGoogle = useCallback(
    async (idToken: string): Promise<void> => {
      try {
        const tokens = await lemonClient.auth.loginWithGoogle({ id_token: idToken });
        handleAuthSuccess(tokens);
      } catch (error) {
        if (error instanceof ApiError) {
          throw new Error(error.message || 'Failed to login with Google');
        }
        throw error;
      }
    },
    [handleAuthSuccess]
  );

  /**
   * Logout and clear all auth data
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      // Try to revoke tokens on server
      await lemonClient.auth.revoke();
    } catch {
      // Ignore errors during logout
    } finally {
      clearStoredAuth();
      setUser(null);
      setAccessToken(null);
      lemonClient.clearAccessToken();
    }
  }, []);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const initAuth = async () => {
      const { accessToken: storedToken } = getStoredTokens();
      const storedUser = getStoredUser();

      if (storedToken && storedUser) {
        // Try to use stored token first
        setAccessToken(storedToken);
        setUser(storedUser);
        lemonClient.setAccessToken(storedToken);

        // Verify token is still valid by refreshing
        // This also gives us a fresh access token
        try {
          await refreshAuth();
        } catch {
          // Token invalid, clear auth
          clearStoredAuth();
          setUser(null);
          setAccessToken(null);
          lemonClient.clearAccessToken();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, [refreshAuth]);

  const isAuthenticated = !!user && !!accessToken;

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        isAuthenticated,
        loginWithGoogle,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Get the lemon client instance
 * Useful for making authenticated API calls
 */
export function getLemonClient(): LemonadeClient {
  return lemonClient;
}

/**
 * Get access token synchronously (for API calls)
 * Returns null if not authenticated
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}
