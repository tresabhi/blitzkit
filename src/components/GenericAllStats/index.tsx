import getWN8Percentile from '../../core/blitz/getWN8Percentile';
import isNumber from '../../core/node/isNumber';
import { AllStats, SupplementaryStats } from '../../types/accountInfo';
import { Card } from './components/Card';
import { Root } from './components/Root';
import { Row } from './components/Row';

// TODO: remove the .js endings

export interface GenericAllStatsProps {
  stats: AllStats;
  supplementaryStats?: SupplementaryStats;
}

export default function GenericAllStats({
  stats,
  supplementaryStats,
}: GenericAllStatsProps) {
  const damageRatio = stats.damage_dealt / stats.damage_received;
  const killsToDeathRatio =
    stats.frags / (stats.battles - stats.survived_battles);

  return (
    <Root>
      <Row>
        <Card
          title="Games"
          items={[
            {
              label: 'Winrate',
              value: `${(100 * (stats.wins / stats.battles)).toFixed(2)}%`,
            },
            {
              label: 'Battles',
              value: stats.battles,
            },
            {
              label: 'Wins / Losses',
              value: `${stats.wins} / ${stats.losses}`,
            },
          ]}
        />
        <Card
          title="Efficiency"
          items={[
            {
              label: 'WN8',
              value:
                supplementaryStats && isNumber(supplementaryStats.WN8)
                  ? supplementaryStats.WN8!.toFixed(0)
                  : undefined,
              percentile: isNumber(supplementaryStats?.WN8)
                ? getWN8Percentile(supplementaryStats!.WN8!)
                : undefined,
            },
            {
              label: 'Survival',
              value: `${(
                100 *
                (stats.survived_battles / stats.battles)
              ).toFixed(2)}%`,
            },
            {
              label: 'Accuracy',
              value: `${((stats.hits / stats.shots) * 100).toFixed(2)}%`,
            },
          ]}
        />
      </Row>
      <Row>
        <Card
          title="Lethality"
          items={[
            {
              label: 'Average damage',
              value: (stats.damage_dealt / stats.battles).toFixed(0),
            },
            {
              label: 'Damage per tier',
              value: supplementaryStats?.tier
                ? (
                    stats.damage_dealt /
                    stats.battles /
                    supplementaryStats.tier
                  ).toFixed(0)
                : undefined,
            },
            {
              label: 'Damage ratio',
              value: isFinite(damageRatio) ? damageRatio.toFixed(2) : undefined,
            },
            {
              label: 'Average kills',
              value: (stats.frags / stats.battles).toFixed(0),
            },
          ]}
        />
        <Card
          title="Miscellaneous"
          items={[
            {
              label: 'Average tier',
              value: supplementaryStats?.tier?.toFixed(2),
            },
            {
              label: 'Average spots',
              value: (stats.spotted / stats.battles).toFixed(2),
            },
            {
              label: 'Average XP',
              value: (stats.xp / stats.battles).toFixed(0),
            },
            {
              label: 'Kills to death ratio',
              value: isFinite(killsToDeathRatio)
                ? killsToDeathRatio.toFixed(2)
                : undefined,
            },
          ]}
        />
      </Row>
    </Root>
  );
}
