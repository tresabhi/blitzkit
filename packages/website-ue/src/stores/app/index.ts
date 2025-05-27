import { merge } from 'lodash-es';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { createContextualStore } from '../../core/zustand/createContextualStore';

export interface WargamingLogin {
  token: string;
  id: number;
  expires: number;
}

interface AppStore {
  developerMode: boolean;
  policiesAgreementIndex: number;
  logins: {
    wargaming?: WargamingLogin;
  };
}

export const App = createContextualStore(() =>
  create<AppStore>()(
    persist(
      subscribeWithSelector<AppStore>(() => ({
        developerMode: false,
        policiesAgreementIndex: -1,
        logins: {},
      })),
      { name: 'app', merge: (a, b) => merge(b, a) },
    ),
  ),
);
