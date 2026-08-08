import { create } from 'zustand';
import { UserProfile } from '@/services/authService';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  setUser: (user: UserProfile) => void;
  setToken: (token: string) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  signOut: () => set({ user: null, token: null })
}));
