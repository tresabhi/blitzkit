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
  login?: Login;
  policiesAgreementIndex: number;
}

export const CURRENT_POLICIES_AGREEMENT_INDEX = 0;

export const useApp = create<App>()(
  persist(
    (set) => ({
      devBuildAgreementTime: 0,
      developerMode: false,
      policiesAgreementIndex: -1,
    }),
    { name: 'app', merge: (a, b) => merge(b, a) },
  ),
);

export function mutateApp(recipe: (draft: App) => void) {
  useApp.setState(produce(recipe));
}
