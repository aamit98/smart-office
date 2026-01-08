/**
 * API Configuration
 * 
 * Centralizes all backend service URLs.
 * In production, these should be loaded from environment variables (VITE_*).
 * For Docker Compose, the values are set in the Dockerfile or docker-compose.yml.
 */

/** Authentication Service base URL */
export const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5001';

/** Resource/Asset Management Service base URL */
export const RESOURCE_API_URL = import.meta.env.VITE_RESOURCE_API_URL || 'http://localhost:5002';

/** Default timeout for API requests (ms) */
export const API_TIMEOUT = 10000;
