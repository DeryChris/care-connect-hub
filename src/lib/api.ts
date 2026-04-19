// src/lib/api.ts
// Central HTTP client — ALL API calls go through here.
// This is the ONLY file that knows about fetch/URLs.

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

// In-memory access token — never in localStorage (prevents XSS theft)
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

// ── Core request ──────────────────────────────────────────────────────────────
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include', // sends httpOnly refresh cookie automatically
    headers,
  });

  // 401 → try silent refresh once, then retry
  if (res.status === 401 && accessToken) {
    const refreshed = await silentRefresh();
    if (refreshed) {
      const retryHeaders = { ...headers, Authorization: `Bearer ${accessToken}` };
      const retry = await fetch(`${BASE_URL}${path}`, {
        ...options,
        credentials: 'include',
        headers: retryHeaders,
      });
      if (!retry.ok) {
        const err = await retry.json().catch(() => ({ error: { message: 'Request failed' } }));
        throw err;
      }
      if (retry.status === 204) return null as T;
      return retry.json();
    } else {
      // Refresh failed — force re-login
      accessToken = null;
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: `HTTP ${res.status}` } }));
    throw err;
  }

  if (res.status === 204) return null as T;
  return res.json();
}

async function silentRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return false;
    const data = await res.json();
    accessToken = data.data?.accessToken ?? null;
    return !!accessToken;
  } catch {
    return false;
  }
}

// ── Public helpers ────────────────────────────────────────────────────────────
export const api = {
  get:    <T>(path: string) =>
    request<T>(path, { method: 'GET' }),

  post:   <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),

  put:    <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),

  patch:  <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),

  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),

  // For multipart/form-data file uploads
  upload: <T>(path: string, formData: FormData, method: 'POST' | 'PUT' = 'POST') =>
    request<T>(path, { method, body: formData }),
};

// ── Query string builder ──────────────────────────────────────────────────────
export function buildQuery(
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `?${qs}` : '';
}
