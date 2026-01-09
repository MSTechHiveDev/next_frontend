"use server";

import { cookies } from 'next/headers';
import { apiServer } from '../api/apiServer';
import { endpoints } from '../config';
import type { LoginRequest, AuthResponse, MeResponse } from '../types';

export async function loginAction(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiServer<AuthResponse>(endpoints.auth.login, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (response.tokens) {
    const cookieStore = await cookies();
    cookieStore.set('accessToken', response.tokens.accessToken, {
      path: '/',
      maxAge: 86400,
      httpOnly: false, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    cookieStore.set('refreshToken', response.tokens.refreshToken, {
      path: '/',
      maxAge: 604800,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  return response;
}

export async function getMeAction(): Promise<MeResponse> {
  return apiServer<MeResponse>(endpoints.auth.me);
}