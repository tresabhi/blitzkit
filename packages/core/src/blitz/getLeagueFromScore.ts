import { LEAGUES } from '@blitzkit/core';

export function getLeagueFromScore(score: number) {
  return LEAGUES.find(({ minScore }) => score >= minScore)!;
}
