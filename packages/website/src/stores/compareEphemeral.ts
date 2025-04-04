import { create } from 'zustand';
import { createContextualStore } from '../core/zustand/createContextualStore';
import type { DuelMember } from './duel';

export interface CompareMember extends DuelMember {
  key: string;
}

export interface CompareEphemeral {
  crewSkills: Record<string, number>;
  members: CompareMember[];
  sorting?: {
    direction: 'ascending' | 'descending';
    by: number;
  };
}

export const CompareEphemeral = createContextualStore(
  (crewSkills: Record<number, number>) =>
    create<CompareEphemeral>()(() => ({
      crewSkills,
      members: [],
    })),
);
