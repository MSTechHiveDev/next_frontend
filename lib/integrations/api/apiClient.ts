import { API_CONFIG } from '../config';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

export async function apiClient<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const isClient = typeof window !== 'undefined';
  let token = isClient ? sessionStorage.getItem('accessToken') : null;

  // Construct headers more robustly
  const headers = new Headers();
  if (!(options?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Merge existing headers if any
  if (options?.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => headers.set(key, value));
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => headers.set(key, value));
    } else {
      Object.entries(options.headers).forEach(([key, value]) => headers.set(key, value));
    }
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_CONFIG.BASE_URL}${path}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    }).catch((fetchError) => {
      // Handle network errors (server not running, CORS, etc.)
      const isAuthCheck = path.includes('/auth/me') || path.includes('/auth/refresh');
      const isLogin = path.includes('/auth/login');

      // Only log warnings (not errors) for network issues to reduce noise
      // These are expected when backend is not running
      if (!isAuthCheck && isLogin) {
        console.warn(`⚠️ Backend server appears to be offline.`);
        console.warn(`   URL: ${API_CONFIG.BASE_URL}`);
        console.warn(`   Please start the backend server to login.`);
      }

      const networkError = new Error(
        fetchError.message === 'Failed to fetch'
          ? `Cannot connect to server. Please ensure the backend is running at ${API_CONFIG.BASE_URL}`
          : `Network error: ${fetchError.message}`
      );
      // Mark as network error so calling code can handle it appropriately
      (networkError as any).isNetworkError = true;
      throw networkError;
    });

    // Handle 401 Unauthorized
    if (res.status === 401 && isClient && !path.includes('/auth/login') && !path.includes('/auth/refresh')) {
      const refreshToken = sessionStorage.getItem('refreshToken');

      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;

          try {
            const refreshRes = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshRes.ok) {
              const data = await refreshRes.json();
              const newAccessToken = data.tokens.accessToken;
              const newRefreshToken = data.tokens.refreshToken;

              sessionStorage.setItem('accessToken', newAccessToken);
              sessionStorage.setItem('refreshToken', newRefreshToken);

              isRefreshing = false;
              onTokenRefreshed(newAccessToken);
            } else {
              throw new Error('Refresh failed');
            }
          } catch (error) {
            isRefreshing = false;
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            window.dispatchEvent(new Event('auth-logout'));
            throw new Error('Session expired');
          }
        }

        return new Promise<T>((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            headers.set('Authorization', `Bearer ${newToken}`);
            fetch(url, { ...options, headers })
              .then(resp => {
                if (!resp.ok) return resp.json().then(err => { throw new Error(err.message || `HTTP ${resp.status}`) });
                return resp.json();
              })
              .then(resolve)
              .catch(reject);
          });
        });
      }
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'API Error' }));
      // Don't log 404 errors - they're expected when trying fallback endpoints
      // and will be handled gracefully by the calling code
      if (res.status !== 404) {
        console.error(`API Error [${res.status}] ${path}:`, errorData);
      }
      // Extract error message - handle both string and object formats
      let errorMessage = errorData.message || `HTTP ${res.status}`;
      if (typeof errorData === 'object' && errorData.error) {
        errorMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error.message || errorMessage;
      }
      const error = new Error(errorMessage);
      (error as any).status = res.status;
      (error as any).error = errorData.error || errorData;
      throw error;
    }

    return res.json();
  } catch (error: any) {
    // Don't log errors for 404 status codes - they're expected when trying fallback endpoints
    // Don't log network errors for auth endpoints (to avoid spam when backend is down)
    const isAuthEndpoint = path.includes('/auth/me') || path.includes('/auth/refresh');
    const isLogin = path.includes('/auth/login');
    const isNetworkError = error?.isNetworkError || error?.message?.includes('Cannot connect to server');

    // Suppress error logging for network errors on auth endpoints (except login which we handle above)
    if (error?.status !== 404 && !error?.message?.includes('404') && !error?.message?.toLowerCase().includes('not found')) {
      if (!isAuthEndpoint || (!isNetworkError && isLogin)) {
        // Only log non-network errors or login errors that aren't network issues
        if (!isNetworkError || isLogin) {
          console.error(`API Error ${path}:`, error);
        }
      }
    }
    throw error;
  }
}