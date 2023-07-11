import { AllStats, SupplementaryStats } from '../../types/accountInfo';
import { WN8Display } from './components/WN8Display';
import {
  WN8SurroundingStat,
  WN8SurroundingStatAlign,
} from './components/WN8SurroundingStat';

export interface AllStatsOverviewProps {
  stats: AllStats;
  supplementaryStats: SupplementaryStats;
}

export default function AllStatsOverview({
  stats,
  supplementaryStats,
}: AllStatsOverviewProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: -64,
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          alignItems: 'flex-end',
          flex: 1,
        }}
      >
        <WN8SurroundingStat
          label="Battles"
          value={stats.battles.toLocaleString()}
          align={WN8SurroundingStatAlign.Right}
        />
        <WN8SurroundingStat
          label="Winrate"
          value={`${(100 * (stats.wins / stats.battles)).toFixed(2)}%`}
          align={WN8SurroundingStatAlign.Right}
          padded
        />
        <WN8SurroundingStat
          label="Damage"
          value={Math.round(
            stats.damage_dealt / stats.battles,
          ).toLocaleString()}
          align={WN8SurroundingStatAlign.Right}
          padded
        />
        <WN8SurroundingStat
          label="Dmg. ratio"
          value={(stats.damage_dealt / stats.damage_received).toFixed(2)}
          align={WN8SurroundingStatAlign.Right}
        />
      </div>

      <WN8Display WN8={supplementaryStats.WN8} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          flex: 1,
        }}
      >
        <WN8SurroundingStat
          label="Tier"
          value={
            supplementaryStats.tier ? supplementaryStats.tier.toFixed(2) : '--'
          }
        />
        <WN8SurroundingStat
          label="Survival"
          value={`${(100 * (stats.survived_battles / stats.battles)).toFixed(
            2,
          )}%`}
          padded
        />
        <WN8SurroundingStat
          label="Accuracy"
          value={`${(100 * (stats.hits / stats.shots)).toFixed(2)}%`}
          padded
        />
        <WN8SurroundingStat
          label="Kill ratio"
          value={(
            stats.frags /
            (stats.battles - stats.survived_battles)
          ).toFixed(2)}
        />
      </div>
    </div>
  );
}
