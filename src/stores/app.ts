import { merge } from 'lodash';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface App {
  devBuildAgreementTime: number;
}

export const useApp = create<App>()(
  persist(
    (set) => ({
      devBuildAgreementTime: 0,
    }),
    { name: 'app', merge: (a, b) => merge(b, a) },
  ),
);
