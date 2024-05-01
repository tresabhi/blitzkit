import calculateWN8 from '../statistics/calculateWN8';
import { AllStats } from './getAccountInfo';

export type Stat = keyof ReturnType<typeof generateStats>;

export const STAT_NAMES: Record<Stat, string> = {
  battles: 'Battles',
  winrate: 'Winrate',
  wn8: 'WN8',
  damage: 'Damage',
};

export function generateStats(s: AllStats, e?: AllStats) {
  return {
    battles: s.battles,
    winrate: s.wins / s.battles,
    wn8: e ? calculateWN8(e, s) : null,
    damage: s.damage_dealt / s.battles,
  };
}

export function prettifyStats(s: ReturnType<typeof generateStats>) {
  return {
    battles: `${s.battles}`,
    winrate: `${(s.winrate * 100).toFixed(0)}%`,
    wn8: s.wn8 ? s.wn8.toFixed(0) : '--',
    damage: s.damage.toFixed(0),
  } satisfies Record<Stat, string>;
}
