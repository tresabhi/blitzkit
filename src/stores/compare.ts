import { produce } from 'immer';
import { merge } from 'lodash';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { DuelMember } from './duel';

export interface CompareMember extends DuelMember {
  key: string;
}

export interface CompareTemporary {
  crewSkills: Record<string, number>;
  members: CompareMember[];
  sorting?: {
    direction: 'ascending' | 'descending';
    by: string;
  };
}

export type DeltaMode = 'none' | 'percentage' | 'absolute';
export interface ComparePersistent {
  deltaMode: DeltaMode;
}

export const useCompareTemporary = create<CompareTemporary>()(() => ({
  crewSkills: {},
  members: [],
}));

export const useComparePersistent = create<ComparePersistent>()(
  persist(
    subscribeWithSelector<ComparePersistent>(() => ({
      deltaMode: 'none',
    })),
    {
      name: 'compare',
      merge: (a, b) => merge(b, a),
    },
  ),
);

export function mutateCompareTemporary(
  recipe: (draft: CompareTemporary) => void,
) {
  useCompareTemporary.setState(produce(recipe));
}

export function mutateComparePersistent(
  recipe: (draft: ComparePersistent) => void,
) {
  useComparePersistent.setState(produce(recipe));
}
