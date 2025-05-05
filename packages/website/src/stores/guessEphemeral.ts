import type { TankDefinition } from '@blitzkit/core';
import { create } from 'zustand';
import { createContextualStore } from '../core/zustand/createContextualStore';

export interface GuessEphemeral {
  tank: TankDefinition;
  // true = correct, false = incorrect, null = not guessed
  guessState: boolean | null;
  totalSeen: number;
  correct: number;
}

export const GuessEphemeral = createContextualStore((tank: TankDefinition) =>
  create<GuessEphemeral>()(() => ({
    tank,
    guessState: null,
    totalSeen: 0,
    correct: 0,
  })),
);
