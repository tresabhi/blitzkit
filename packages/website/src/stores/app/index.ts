import { create } from 'zustand';
import { createContextualStore } from '../../core/zustand/createContextualStore';

interface AppStore {
  developerMode: boolean;
  policiesAgreementIndex: number;
}

export const App = createContextualStore(() =>
  create<AppStore>()(() => ({
    developerMode: false,
    policiesAgreementIndex: 0,
  })),
);
