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
  let token = isClient ? localStorage.getItem('accessToken') : null;

  // Construct headers more robustly
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');

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
    });

    // Handle 401 Unauthorized
    if (res.status === 401 && isClient && !path.includes('/auth/login') && !path.includes('/auth/refresh')) {
      const refreshToken = localStorage.getItem('refreshToken');

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

              localStorage.setItem('accessToken', newAccessToken);
              localStorage.setItem('refreshToken', newRefreshToken);

              isRefreshing = false;
              onTokenRefreshed(newAccessToken);
            } else {
              throw new Error('Refresh failed');
            }
          } catch (error) {
            isRefreshing = false;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
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
      console.error(`API Error [${res.status}] ${path}:`, errorData);
      const error = new Error(errorData.message || `HTTP ${res.status}`);
      (error as any).status = res.status;
      throw error;
    }

    return res.json();
  } catch (error: any) {
    console.error(`Fetch Error ${path}:`, error);
    throw error;
  }
}