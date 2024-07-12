import { TankPerformanceSortType } from '.';

export const TankPerformanceSortTypeNames = {
  winrate: 'Winrate',
  players: 'Players',
  battles: 'Battles (total)',
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

export const TankPerformanceSortTypeNamesArray = Object.keys(
  TankPerformanceSortTypeNames,
) as TankPerformanceSortType[];
