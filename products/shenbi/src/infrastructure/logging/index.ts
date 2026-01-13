/**
 * Logging Module
 *
 * Provides frontend logging utilities that send logs to the backend API.
 *
 * Usage:
 *   import { info, warn, error } from '../infrastructure/logging';
 *
 *   info('User logged in', { userId: 123 }, 'AuthContext');
 *   warn('API rate limit approaching', { remaining: 10 });
 *   error('Failed to load level', err, { levelId: 5 }, 'GamePage');
 */

export { logger, debug, info, warn, error, setAuthToken, setEnabled, flush } from './logger';
