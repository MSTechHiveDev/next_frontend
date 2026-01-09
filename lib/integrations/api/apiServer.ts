import { API_CONFIG } from '../config';
import { cookies } from 'next/headers';

export async function apiServer<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  console.log(`[apiServer] Request to: ${path}`);
  console.log(`[apiServer] Token found in cookies: ${accessToken ? 'YES (Starts with ' + accessToken.substring(0, 10) + '...)' : 'NO'}`);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (accessToken) {
    (headers as any)['Authorization'] = `Bearer ${accessToken}`;
  } else {
    console.warn(`[apiServer] ⚠️ NO ACCESS TOKEN for path: ${path}`);
  }

  const res = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'API Server Error' }));
    throw new Error(errorData.message || `HTTP ${res.status}`);
  }

  return res.json();
}