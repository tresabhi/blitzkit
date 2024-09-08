import { RatingPlayer } from '../../../bot/src/commands/ratingLeaderboard';
import { RatingStats } from '../../../website/src/core/blitz/getAccountInfo';
import { BkrlSuperset1Entry } from '../streams/bkrl';

export function deltaBkrlBlitzStats(
  a: BkrlSuperset1Entry,
  b1: RatingStats,
  b2: RatingPlayer,
) {
  return {
    battles: b1.battles - a.battles,
    damage: b1.damage_dealt - a.damage,
    kills: b1.frags - a.kills,
    survived: b1.survived_battles - a.survived,
    wins: b1.wins - a.wins,
    score: b2.score - a.score,
  } satisfies Omit<BkrlSuperset1Entry, 'id'>;
}
