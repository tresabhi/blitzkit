import { merge } from 'lodash';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface App {
  devBuildAgreementTime: number;
  developerMode: boolean;
  darkMode: boolean;
}

export const useApp = create<App>()(
  persist(
    (set) => ({
      devBuildAgreementTime: 0,
      developerMode: false,
      darkMode: true,
    }),
    { name: 'app', merge: (a, b) => merge(b, a) },
  ),
);
