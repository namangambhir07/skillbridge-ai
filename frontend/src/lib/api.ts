/**
 * Resolves the API base URL cleanly across environments:
 * 1. Reads import.meta.env.VITE_API_BASE_URL or import.meta.env.VITE_API_URL
 * 2. Trims whitespace and removes trailing slashes
 * 3. Intelligently ensures the /api/v1 prefix is present without duplication:
 *    - "https://api.example.com" -> "https://api.example.com/api/v1"
 *    - "https://api.example.com/api" -> "https://api.example.com/api/v1"
 *    - "https://api.example.com/api/v1" -> "https://api.example.com/api/v1"
 * 4. Falls back to "/api/v1" when no env variable is provided (for local Vite dev proxy)
 */
export function getApiBaseUrl(): string {
  // Prioritize VITE_API_URL (canonical), fallback to VITE_API_BASE_URL
  const rawUrl = (
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL)) ||
    ''
  ).trim();

  if (!rawUrl) {
    return '/api/v1';
  }

  // Parse absolute HTTP/HTTPS URLs
  try {
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      const parsed = new URL(rawUrl);
      let pathname = parsed.pathname.replace(/\/+$/, '');

      // Strip accidental health check path suffixes (e.g., /health, /api/v1/health)
      pathname = pathname.replace(/\/health\/?$/i, '');

      if (pathname.includes('/api/v1')) {
        pathname = pathname.substring(0, pathname.indexOf('/api/v1') + '/api/v1'.length);
      } else if (pathname.endsWith('/api')) {
        pathname = `${pathname}/v1`;
      } else if (!pathname || pathname === '/') {
        pathname = '/api/v1';
      } else {
        pathname = `${pathname}/api/v1`;
      }

      return `${parsed.origin}${pathname}`;
    }
  } catch {
    // Fall back to string-based cleaning if URL parsing fails
  }

  let clean = rawUrl.replace(/\/+$/, '').replace(/\/health\/?$/i, '');
  if (clean.includes('/api/v1')) {
    clean = clean.substring(0, clean.indexOf('/api/v1') + '/api/v1'.length);
  } else if (clean.endsWith('/api')) {
    clean = `${clean}/v1`;
  } else if (!clean.endsWith('/api/v1')) {
    clean = `${clean}/api/v1`;
  }

  return clean;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('skillbridge_token');
  const headers = new Headers(options.headers || {});

  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const base = getApiBaseUrl();
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // If caller accidentally passed /api/v1/... or /api/... (avoid duplicate prefixes)
  if (cleanEndpoint.startsWith('/api/v1/')) {
    cleanEndpoint = cleanEndpoint.substring('/api/v1'.length);
  } else if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.substring('/api'.length);
  }

  const url = `${base}${cleanEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(data?.error || data?.message || 'Request failed', response.status, data);
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
