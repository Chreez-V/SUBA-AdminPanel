/**
 * API Configuration
 * Detects environment and sets the appropriate API Base URL
 */

// Detect environment and set API Base URL
const isDevelopment = 
  process.env.NODE_ENV === 'development' || 
  (typeof window !== 'undefined' && 
   (window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1'));

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3500'  // Local backend
  : 'https://subapp-api.onrender.com';  // Production backend

// Log para debugging
if (typeof window !== 'undefined') {
  console.log('🌐 API Environment:', isDevelopment ? 'Development (Local)' : 'Production');
  console.log('🔗 API Base URL:', API_BASE_URL);
}

/**
 * Get authentication headers for API requests
 * Retrieves the token from cookies
 * @param includeContentType - Whether to include Content-Type header (default: true)
 */
export function getAuthHeaders(includeContentType: boolean = true): HeadersInit {
  const token = typeof document !== 'undefined' 
    ? document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
    : null;

  const headers: HeadersInit = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}
