import lodash from 'lodash-es';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createContextualSafeStore } from '../../core/zustand/createContextualSafeStore';

export interface App {
  developerMode: boolean;
  policiesAgreementIndex: number;
}

export const { Provider, use, useMutation, useStore, useDeferred } =
  createContextualSafeStore(() =>
    create<App>()(
      persist(
        (set) => ({
          developerMode: false,
          policiesAgreementIndex: -1,
          logins: {},
        }),
        { name: 'app', merge: (a, b) => lodash.merge(b, a) },
      ),
    ),
  );
