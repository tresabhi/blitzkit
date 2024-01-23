import { produce } from 'immer';
import { create } from 'zustand';
import { DuelMember } from './tankopedia';

export interface Duel {
  assigned: boolean;
  protagonist?: DuelMember;
  antagonist?: DuelMember;
}

export const useDuel = create<Duel>()(() => ({
  assigned: false,
}));

export function mutateDuel(recipe: (draft: Duel) => void) {
  useDuel.setState(produce(recipe));
}
