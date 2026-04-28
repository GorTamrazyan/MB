import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@tina/shared';
import { setAccessToken } from '../lib/api';

interface AuthState {
  user: Pick<User, 'id' | 'email' | 'role'> | null;
  accessToken: string | null;
  setAuth: (user: Pick<User, 'id' | 'email' | 'role'>, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => {
        setAccessToken(accessToken);
        set({ user, accessToken });
      },
      clearAuth: () => {
        setAccessToken(null);
        if (typeof document !== 'undefined') {
          document.cookie = 'user=; path=/; max-age=0';
        }
        set({ user: null, accessToken: null });
      },
    }),
    {
      name: 'auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
