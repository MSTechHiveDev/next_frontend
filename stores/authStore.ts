import { create } from 'zustand';
import { authService, type RegisterRequest } from '@/lib/integrations';
import { loginAction } from '@/lib/integrations/actions/auth.actions';

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
  logout: (broadcast?: boolean) => void;
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
      // Signal received from current tab's API client (e.g. 401 Unauthorized)
      window.addEventListener('auth-logout', () => {
        get().logout(false);
      });
    }
  },

  login: async (identifier: string, password: string) => {
    set({ isLoading: true });
    try {
      console.log('[Auth] Attempting login for:', identifier);
      // Use loginAction (Server Action) to set cookies correctly
      const response = await loginAction({ identifier, password });
      console.log('[Auth] loginAction (Server Side) response received');
      const { tokens, user } = response;

      console.log('[Auth] Login successful:', {
        userId: user.id,
        userName: user.name,
        role: user.role,
        hasAccessToken: !!tokens.accessToken,
        hasRefreshToken: !!tokens.refreshToken
      });

      // PER-TAB ISOLATION: Use sessionStorage for tokens AND current user
      sessionStorage.setItem('accessToken', tokens.accessToken);
      sessionStorage.setItem('refreshToken', tokens.refreshToken);
      sessionStorage.setItem('user', JSON.stringify(user));

      // SERVER-SIDE COMPATIBILITY: Set cookies so Server Components/Actions can access tokens
      if (typeof document !== 'undefined') {
        document.cookie = `accessToken=${tokens.accessToken}; path=/; max-age=86400; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
        document.cookie = `refreshToken=${tokens.refreshToken}; path=/; max-age=604800; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
      }

      // PERSISTENT REGISTRY: Use localStorage for user data keyed by ID
      // This prevents account overlap when using multiple accounts in different tabs
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(user));
      localStorage.setItem('lastUserId', user.id);

      console.log('[Auth] Tokens saved to sessionStorage, user data to localStorage');
      set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });
    } catch (error) {
      console.error('[Auth] Login failed:', error);
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

  logout: (broadcast = true) => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');

    // Clear cookies
    if (typeof document !== 'undefined') {
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }

    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = sessionStorage.getItem('accessToken');
    const refreshToken = sessionStorage.getItem('refreshToken');
    const sessionUser = sessionStorage.getItem('user');

    // Try to restore user from session first
    if (sessionUser && !get().user) {
      try {
        const user = JSON.parse(sessionUser);
        set({ user, isAuthenticated: !!token });
      } catch (e) { }
    }

    console.log('[Auth] Checking authentication...', {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
    });

    if (!token) {
      console.log('[Auth] No access token found, user is not authenticated');
      set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
      return;
    }

    set({ isLoading: true });
    try {
      const user = await authService.getMeClient();
      console.log('[Auth] ✅ Authentication successful:', {
        userId: user.id,
        userName: user.name,
        role: user.role
      });

      // Keep session updated
      sessionStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(user));
      localStorage.setItem('lastUserId', user.id);

      set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });

      // Ensure cookies are set for server actions
      if (typeof document !== 'undefined') {
        const hasCookie = document.cookie.includes('accessToken=');
        if (!hasCookie && token) {
           document.cookie = `accessToken=${token}; path=/; max-age=86400; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
           if (refreshToken) {
             document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
           }
        }
      }
    } catch (error: any) {
      console.log('[Auth] Error during auth check:', error.message);

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
        console.warn('[Auth] ⚠️ Backend server unavailable. Using cached session data.');

        // Try to restore user from localStorage
        const lastUserId = localStorage.getItem('lastUserId');
        const storedUser = sessionUser || (lastUserId ? localStorage.getItem(`profile_${lastUserId}`) : null);

        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            console.log('[Auth] Restored user from cache:', { userId: user.id, role: user.role });
            set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });
            return;
          } catch (e) {
            console.error('[Auth] Failed to parse stored user:', e);
          }
        }

        // If no stored user but we have a token, assume authenticated but mark as initialized
        // This prevents redirect loop while backend is down
        console.log('[Auth] Keeping session active despite network error');
        set({ isLoading: false, isInitialized: true, isAuthenticated: true });
        return;
      }

      if (isAuthError) {
        // Actual auth failure - log out
        console.log('[Auth] ❌ Authentication failed. Logging out current tab...');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
        set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
      } else {
        // Other errors - keep user logged in but mark as initialized
        console.error('[Auth] Unexpected error during auth check:', error);
        // Try to use cached user if available
        const lastUserId = localStorage.getItem('lastUserId');
        const storedUser = sessionUser || (lastUserId ? localStorage.getItem(`profile_${lastUserId}`) : null);

        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            console.log('[Auth] Using cached user due to unexpected error:', { userId: user.id, role: user.role });
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