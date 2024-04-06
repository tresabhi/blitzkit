import { produce } from 'immer';
import { merge } from 'lodash';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { DuelMember } from './duel';

export interface CompareMember extends DuelMember {
  key: string;
  crewSkills: Record<string, number>;
}

export interface CompareTemporary {
  members: CompareMember[];
  sorting?: {
    direction: 'ascending' | 'descending';
    by: string;
  };
}

export type DeltaMode = 'none' | 'percentage' | 'nominal';
export interface ComparePersistent {
  deltaMode: DeltaMode;
}

export const useCompareTemporary = create<CompareTemporary>()(() => ({
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
