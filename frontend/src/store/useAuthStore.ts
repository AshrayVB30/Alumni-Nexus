import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isHydrated: boolean;
  setIsHydrated: (state: boolean) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isHydrated: false,
      setIsHydrated: (state: boolean) => set({ isHydrated: state }),
      setAuth: (user: User, token: string) => {
        set({ user, token });
      },
      logout: () => {
        set({ user: null, token: null });
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setIsHydrated(true);
        }
      },
    }
  )
);

export { useAuthStore };
