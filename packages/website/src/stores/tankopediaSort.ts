import { create } from 'zustand';
import { createContextualSafeStore } from '../core/zustand/createContextualSafeStore';
import {
  TankopediaSortBy,
  TankopediaSortDirection,
} from './tankopediaPersistent';

export interface TankopediaSort {
  by: TankopediaSortBy;
  direction: TankopediaSortDirection;
}

export const { Provider, use, useMutation, useStore } =
  createContextualSafeStore(() =>
    create<TankopediaSort>()(() => ({
      by: 'meta.none',
      direction: 'descending',
    })),
  );
