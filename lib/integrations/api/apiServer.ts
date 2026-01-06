import { API_CONFIG } from '../config';
import { cookies } from 'next/headers';

export async function apiServer<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const cookieStore = cookies();

  const res = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieStore.toString(),
      ...options?.headers,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'API Server Error' }));
    throw new Error(errorData.message || `HTTP ${res.status}`);
  }

  return res.json();
}