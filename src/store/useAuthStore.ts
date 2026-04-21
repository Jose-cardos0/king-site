import { create } from 'zustand';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, ADMIN_EMAIL } from '@/services/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  init: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isAdmin: false,
  init: () => {
    const unsub = onAuthStateChanged(auth, (user) => {
      set({
        user,
        loading: false,
        isAdmin: !!user && user.email === ADMIN_EMAIL,
      });
    });
    return unsub;
  },
}));
