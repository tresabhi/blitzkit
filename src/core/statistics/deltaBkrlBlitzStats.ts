import { RatingPlayer } from '../../commands/ratingLeaderboard';
import { RatingStats } from '../blitz/getAccountInfo';
import { BkrlSuperset1Entry } from '../streams/bkrl';

export function deltaBkrlBlitzStats(
  a: BkrlSuperset1Entry,
  b1: RatingStats,
  b2: RatingPlayer,
) {
  return {
    battles: b1.battles - a.battles,
    damageDealt: b1.damage_dealt - a.damageDealt,
    damageReceived: b1.damage_received - a.damageReceived,
    hits: b1.hits - a.hits,
    kills: b1.frags - a.kills,
    shots: b1.shots - a.shots,
    survived: b1.survived_battles - a.survived,
    wins: b1.wins - a.wins,
    score: b2.score - a.score,
  } satisfies Omit<BkrlSuperset1Entry, 'id'>;
}
