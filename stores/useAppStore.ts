import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type User = { id: string; name: string } | null;

type AppState = {
  user: User;
  setUser: (u: User) => void;
};

const makeStore = () =>
  create<AppState>()(
    devtools(
      persist(
        (set) => ({
          user: null,
          setUser: (u) => set({ user: u }),
        }),
        {
          name: 'app-storage',
          partialize: (s) => ({ user: s.user }), // persist only user
        }
      )
    )
  );

// export the store instance
export const useAppStore = makeStore();
