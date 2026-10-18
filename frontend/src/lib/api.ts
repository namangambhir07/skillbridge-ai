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
  const envUrl = (
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL)) ||
    ''
  )
    .trim()
    .replace(/\/+$/, '');

  if (!envUrl) {
    return '/api/v1';
  }

  if (envUrl.endsWith('/api/v1')) {
    return envUrl;
  }

  if (envUrl.endsWith('/api')) {
    return `${envUrl}/v1`;
  }

  return `${envUrl}/api/v1`;
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

  // If caller accidentally passed /api/v1/... (avoid duplicate /api/v1/api/v1/...)
  if (cleanEndpoint.startsWith('/api/v1/')) {
    cleanEndpoint = cleanEndpoint.substring('/api/v1'.length);
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
