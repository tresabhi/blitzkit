import { produce } from 'immer';
import { create } from 'zustand';
import { DuelMember } from './duel';

export interface CompareMember extends DuelMember {
  crewSkills: Record<string, number>;
}

export interface Compare {
  members: CompareMember[];
}

export const useCompare = create<Compare>()(() => ({
  members: [],
}));

export default function mutateCompare(recipe: (draft: Compare) => void) {
  useCompare.setState(produce(recipe));
}
