import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface App {
  bypassDevBuildAlert: boolean;
}

export const useApp = create<App>()(
  persist(
    (set) => ({
      bypassDevBuildAlert: false,
    }),
    { name: 'app' },
  ),
);
