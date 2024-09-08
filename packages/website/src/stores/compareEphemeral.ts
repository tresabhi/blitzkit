'use client';

import { createNextSafeStore } from '@blitzkit/core';
import { create } from 'zustand';
import { DuelMember } from './duel';

export interface CompareMember extends DuelMember {
  key: string;
}

export interface CompareEphemeral {
  crewSkills: Record<string, number>;
  members: CompareMember[];
  sorting?: {
    direction: 'ascending' | 'descending';
    by: string;
  };
}

export const { Provider, use, useMutation, useStore } = createNextSafeStore(
  () =>
    create<CompareEphemeral>()(() => ({
      crewSkills: {},
      members: [],
    })),
);
