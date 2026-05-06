/**
 * Centralized API configuration for the Grelinhealth platform.
 * 
 * VITE_API_URL should be set in your .env file for production.
 * In development, it defaults to the local proxy server.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// The proxy endpoint used to bypass CORS for API testing
export const PROXY_URL = `${API_BASE_URL}/proxy`;
