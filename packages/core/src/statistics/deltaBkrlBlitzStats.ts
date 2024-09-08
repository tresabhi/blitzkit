import { RatingStats } from '../blitz/getAccountInfo';
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
export interface RatingPlayer {
  spa_id: number;
  mmr: number;
  season_number: number;
  calibrationBattlesLeft: number;
  number: number;
  percentile: number;
  skip: boolean;
  updated_at: string;
  score: number;
  nickname: string;
  clan_tag: string;
}
