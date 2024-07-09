import { TankPerformanceSortType } from '.';

export const tankPerformanceSortTypeNames = {
  winrate: 'Winrate',
  players: 'Players (30d)',
  battles: 'Battles (career)',
  damage: 'Damage',
  survival: 'Survival',
  xp: 'XP',
  kills: 'Kills',
  spots: 'Spots',
  accuracy: 'Accuracy',
  shots: 'Shots',
  hits: 'Hits',
  damageRatio: 'Dmg. ratio',
  damageTaken: 'Dmg. taken',
  capturePoints: 'Cap points',
} as const;
export const tankPerformanceSortTypeNamesArray = Object.keys(
  tankPerformanceSortTypeNames,
) as TankPerformanceSortType[];
