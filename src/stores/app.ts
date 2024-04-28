import { produce } from 'immer';
import { merge } from 'lodash';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Login {
  id: number;
  token: string;
  expiresAt: number;
}

export interface App {
  devBuildAgreementTime: number;
  developerMode: boolean;
  darkMode: boolean;
  login?: Login;
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

export function mutateApp(recipe: (draft: App) => void) {
  useApp.setState(produce(recipe));
}
