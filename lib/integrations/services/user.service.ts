import { endpoints } from '../config';
import { apiClient } from '../api';
import type { User } from '../types';

export const userService = {
  // Client-side
  getAllClient: () =>
    apiClient<User[]>(endpoints.users),
};