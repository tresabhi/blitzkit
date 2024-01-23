import { produce } from 'immer';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { DuelMember } from './tankopedia';

export interface Duel {
  assigned: boolean;
  protagonist?: DuelMember;
  antagonist?: DuelMember;
}

export const useDuel = create<Duel>()(
  subscribeWithSelector<Duel>(() => ({
    assigned: false,
  })),
);

export function mutateDuel(recipe: (draft: Duel) => void) {
  useDuel.setState(produce(recipe));
}
