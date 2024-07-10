'use client';

import { merge } from 'lodash';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createNextSafeStore } from '../../core/zustand/createNextSafeStore';

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

export const { Provider, use, useMutation, useStore } = createNextSafeStore(
  () =>
    create<App>()(
      persist(
        (set) => ({
          devBuildAgreementTime: 0,
          developerMode: false,
          policiesAgreementIndex: -1,
          logins: {},
        }),
        { name: 'app', merge: (a, b) => merge(b, a) },
      ),
    ),
);
