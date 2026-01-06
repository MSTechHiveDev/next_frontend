"use server";

import { apiServer } from '../api/apiServer';
import { endpoints } from '../config';
import type { LoginRequest, AuthResponse, MeResponse } from '../types';

export async function loginAction(data: LoginRequest): Promise<AuthResponse> {
  return apiServer<AuthResponse>(endpoints.auth.login, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMeAction(): Promise<MeResponse> {
  return apiServer<MeResponse>(endpoints.auth.me);
}