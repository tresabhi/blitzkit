import { LEAGUES } from '../../constants/leagues';

export function getLeagueFromScore(score: number) {
  return LEAGUES.find(({ minScore }) => score >= minScore)!;
}
