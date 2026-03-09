/**
 * Central API configuration.
 *
 * During LOCAL DEVELOPMENT, set to http://localhost:5000 so you
 * don't hit the Render free-tier cold-start delay.
 *
 * Before deploying to production, change this back to:
 * https://smartcash-x4j5.onrender.com
 */
export const API_BASE = 'https://smartcash-eudv.onrender.com';

/** Convenience helper — same as API_BASE */
export const api = (path: string) => `${API_BASE}${path}`;
