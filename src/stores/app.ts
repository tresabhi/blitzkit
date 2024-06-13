import { produce } from 'immer';
import { merge } from 'lodash';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WargamingLogin {
  id: number;
  token: string;
  expires: number;
}

interface PatreonLogin {
  token: string;
  refreshToken: string;
  expires: number;
}

export interface App {
  devBuildAgreementTime: number;
  developerMode: boolean;
  logins: {
    wargaming?: WargamingLogin;
    patreon?: PatreonLogin;
  };
  policiesAgreementIndex: number;
}

export const CURRENT_POLICIES_AGREEMENT_INDEX = 0;

export const useApp = create<App>()(
  persist(
    (set) => ({
      devBuildAgreementTime: 0,
      developerMode: false,
      policiesAgreementIndex: -1,
      logins: {},
    }),
    { name: 'app', merge: (a, b) => merge(b, a) },
  ),
);

export function mutateApp(recipe: (draft: App) => void) {
  useApp.setState(produce(recipe));
}
