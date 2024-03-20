import { RatingStats } from '../blitz/getAccountInfo';
import { BkrlComprehensive1Entry, BkrlMinimalEntry } from '../streams/bkrl';

export function deltaBkrlBlitzStats(
  a: BkrlComprehensive1Entry,
  b: RatingStats,
) {
  return {
    battles: b.battles - a.battles,
    damageDealt: b.damage_dealt - a.damageDealt,
    damageReceived: b.damage_received - a.damageReceived,
    hits: b.hits - a.hits,
    kills: b.frags - a.kills,
    shots: b.shots - a.shots,
    survived: b.survived_battles - a.survived,
    wins: b.wins - a.wins,
  } satisfies Omit<BkrlComprehensive1Entry, keyof BkrlMinimalEntry>;
}
