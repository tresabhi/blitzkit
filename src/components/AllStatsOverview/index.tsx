import { Locale } from 'discord.js';
import { AllStats, SupplementaryStats } from '../../core/blitz/getAccountInfo';
import { translator } from '../../core/localization/translator';
import { WN8Display } from './components/WN8Display';
import {
  WN8SurroundingStat,
  WN8SurroundingStatAlign,
} from './components/WN8SurroundingStat';

export interface AllStatsOverviewProps {
  stats: AllStats;
  supplementaryStats: SupplementaryStats;
  locale: Locale;
}

export default function AllStatsOverview({
  stats,
  locale,
  supplementaryStats,
}: AllStatsOverviewProps) {
  const { t } = translator(locale);

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
          label={t`bot.commands.stats.body.battles`}
          value={stats.battles.toLocaleString()}
          align={WN8SurroundingStatAlign.Right}
        />
        <WN8SurroundingStat
          label={t`bot.commands.stats.body.winrate`}
          value={`${(100 * (stats.wins / stats.battles)).toFixed(2)}%`}
          align={WN8SurroundingStatAlign.Right}
          padded
        />
        <WN8SurroundingStat
          label={t`bot.commands.stats.body.damage`}
          value={Math.round(
            stats.damage_dealt / stats.battles,
          ).toLocaleString()}
          align={WN8SurroundingStatAlign.Right}
          padded
        />
        <WN8SurroundingStat
          label={t`bot.commands.stats.body.damage_ratio`}
          value={(stats.damage_dealt / stats.damage_received).toFixed(2)}
          align={WN8SurroundingStatAlign.Right}
        />
      </div>

      <WN8Display locale={locale} wn8={supplementaryStats.WN8} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          flex: 1,
        }}
      >
        <WN8SurroundingStat
          label={t`bot.commands.stats.body.tier`}
          value={
            supplementaryStats.tier ? supplementaryStats.tier.toFixed(2) : '--'
          }
        />
        <WN8SurroundingStat
          label={t`bot.commands.stats.body.survival`}
          value={`${(100 * (stats.survived_battles / stats.battles)).toFixed(
            2,
          )}%`}
          padded
        />
        <WN8SurroundingStat
          label={t`bot.commands.stats.body.accuracy`}
          value={`${(100 * (stats.hits / stats.shots)).toFixed(2)}%`}
          padded
        />
        <WN8SurroundingStat
          label={t`bot.commands.stats.body.kill_ratio`}
          value={(
            stats.frags /
            (stats.battles - stats.survived_battles)
          ).toFixed(2)}
        />
      </div>
    </div>
  );
}
