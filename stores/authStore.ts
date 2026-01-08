import { create } from 'zustand';
import { authService, type RegisterRequest } from '@/lib/integrations';

interface User {
  id: string;
  name: string;
  role: string;
  // add other fields as needed
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  initEvents: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  initEvents: () => {
    if (typeof window !== 'undefined') {
      window.addEventListener('auth-logout', () => {
        get().logout();
      });
    }
  },

  login: async (identifier: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authService.loginClient({ identifier, password });
      const { tokens, user } = response;
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      // Store user in localStorage for offline recovery
      localStorage.setItem('user', JSON.stringify(user));

      // Set Cookies for Server Components (apiServer.ts)
      document.cookie = `accessToken=${tokens.accessToken}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `refreshToken=${tokens.refreshToken}; path=/; max-age=604800; SameSite=Lax`;

      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true });
    try {
      await authService.registerClient(data);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
      return;
    }

    set({ isLoading: true });
    try {
      const user = await authService.getMeClient();
      // Store user in localStorage for offline recovery
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });
    } catch (error: any) {
      // Check if it's a network error (backend unavailable)
      const isNetworkError = error?.isNetworkError ||
        error?.message?.includes('Cannot connect to server') ||
        error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('Network error');

      // Check if it's an actual authentication error
      const isAuthError = error?.status === 401 ||
        error?.status === 403 ||
        error?.message?.includes('Session expired') ||
        error?.message?.includes('Unauthorized') ||
        error?.message?.includes('Not authenticated');

      if (isNetworkError) {
        // Backend unavailable - keep user logged in using cached data
        console.warn('⚠️ Backend server unavailable. Using cached session data.');

        // Try to restore user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });
            return;
          } catch (e) {
            console.error('Failed to parse stored user:', e);
          }
        }

        // If no stored user but we have a token, assume authenticated but mark as initialized
        // This prevents redirect loop while backend is down
        set({ isLoading: false, isInitialized: true, isAuthenticated: true });
        return;
      }

      if (isAuthError) {
        // Actual auth failure - log out
        console.log('Authentication failed. Logging out...');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
      } else {
        // Other errors - keep user logged in but mark as initialized
        console.error('Auth check error:', error);
        // Try to use cached user if available
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });
            return;
          } catch (e) {
            // Invalid stored user
          }
        }
        set({ isLoading: false, isInitialized: true });
      }
    }
  },
}));