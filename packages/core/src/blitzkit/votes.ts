export interface TankVotes {
  categories: Record<TankVoteCategory, number | null>;
  votes: number;
  last_updated?: number;
}
export const TANK_VOTE_CATEGORIES = [
  'easiness',
  'firepower',
  'maneuverability',
  'survivability',
];
export type TankVoteCategory = (typeof TANK_VOTE_CATEGORIES)[number];
export type StarsInt = 1 | 2 | 3 | 4 | 5;
