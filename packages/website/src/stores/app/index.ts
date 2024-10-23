import { merge } from 'lodash-es';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { createContextualStore } from '../../core/zustand/createContextualStore';

interface AppStore {
  developerMode: boolean;
  policiesAgreementIndex: number;
  logins: {
    wargaming?: { token: string; id: number; expires: number };
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
