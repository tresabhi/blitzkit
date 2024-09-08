import { TankVoteCategory } from '../../../api/src/app/tank-voting/[id]/cast/route';

export interface TankVotes {
  categories: Record<TankVoteCategory, number | null>;
  votes: number;
  last_updated?: number;
}
