import getWN8Percentile from '../core/blitz/getWN8Percentile.js';
import { AllStats, SupplementaryStats } from '../types/accountInfo.js';
import GenericStats from './GenericStats/index.js';

export interface GenericAllStatsProps {
  stats: AllStats;
  supplementaryStats?: SupplementaryStats;
}

export default function GenericAllStats({
  stats,
  supplementaryStats,
}: GenericAllStatsProps) {
  return (
    <GenericStats
      stats={[
        ['Winrate', `${(100 * (stats.wins / stats.battles)).toFixed(2)}%`],
        [
          'WN8',
          supplementaryStats?.WN8.toFixed(0) ?? -Infinity,
          supplementaryStats
            ? getWN8Percentile(supplementaryStats.WN8)
            : undefined,
        ],
        [
          'Survival',
          `${(100 * (stats.survived_battles / stats.battles)).toFixed(2)}%`,
        ],
        ['Accuracy', `${((stats.hits / stats.shots) * 100).toFixed(2)}%`],
        ['Battles', stats.battles],
        ['Wins', stats.wins],
        ['Losses', stats.losses],
        ['Average damage', (stats.damage_dealt / stats.battles).toFixed(0)],
        ['Average tier', supplementaryStats?.tier.toFixed(2) ?? -Infinity],
        ['Average XP', (stats.xp / stats.battles).toFixed(0)],
        ['Average shots', (stats.shots / stats.battles).toFixed(2)],
        ['Average hits', (stats.hits / stats.battles).toFixed(2)],
        ['Average kills', (stats.frags / stats.battles).toFixed(2)],
        ['Average spots', (stats.spotted / stats.battles).toFixed(2)],
        [
          'Damage ratio',
          (stats.damage_dealt / stats.damage_received).toFixed(2),
        ],
        [
          'Kills to death ratio',
          (stats.frags / (stats.battles - stats.survived_battles)).toFixed(2),
        ],
      ]}
    />
  );
}
