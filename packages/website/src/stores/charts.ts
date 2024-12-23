import type { Samples } from '@blitzkit/core';
import { create } from 'zustand';
import { createContextualStore } from '../core/zustand/createContextualStore';

export interface Charts {
  period: ChartsPeriod;
}

export type ChartsPeriod = keyof Samples;

export const Charts = createContextualStore(() =>
  create<Charts>()(() => ({
    period: 'd_30',
  })),
);
