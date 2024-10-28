import { type IndividualTankStats } from '@blitzkit/core';
import * as lodash from 'lodash-es';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createContextualStore } from '../core/zustand/createContextualStore';

type EmbedBreakdownPersistentStore = Record<number, IndividualTankStats[]>;

export const EmbedBreakdownPersistent = createContextualStore(() =>
  create<EmbedBreakdownPersistentStore>()(
    persist(() => ({}), {
      name: 'embed-breakdown',
      merge: (a, b) => lodash.merge(b, a),
    }),
  ),
);
