export const API_BASE_URL = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';

export interface FetchOptions extends RequestInit {
  timeout?: number;
}

export async function fetchFromApi(endpoint: string, options: FetchOptions = {}) {
  const { timeout = 5000, ...fetchOptions } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}
