import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AppState {
  user: User | any | null;
  userData: any | null;
  setUser: (user: User | any | null) => void;
  setUserData: (data: any | null) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  userData: null,
  setUser: (user) => set({ user }),
  setUserData: (userData) => set({ userData }),
}));
