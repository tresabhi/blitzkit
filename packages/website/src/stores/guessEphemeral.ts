import type { TankDefinition } from '@blitzkit/core';
import { create } from 'zustand';
import { createContextualStore } from '../core/zustand/createContextualStore';

export interface GuessEphemeral {
  tank: TankDefinition;
  // true = correct, false = incorrect, null = not guessed
  guessState: boolean | null;
  totalGuesses: number;
  correctGuesses: number;
}

export const GuessEphemeral = createContextualStore((tank: TankDefinition) =>
  create<GuessEphemeral>()(() => ({
    tank,
    guessState: null,
    totalGuesses: 0,
    correctGuesses: 0,
  })),
);
