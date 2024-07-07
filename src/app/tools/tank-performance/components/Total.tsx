import { Table } from '@radix-ui/themes';
import { memo, useCallback } from 'react';
import {
  AverageDefinitionsAllStats,
  AverageDefinitionsEntryWithId,
} from '../../../../core/blitzkit/averageDefinitions';
import { useAveragesExclusionRatio } from '../../../../hooks/useAveragesExclusionRatio';

interface TotalProps {
  tanks: AverageDefinitionsEntryWithId[];
}

export const Total = memo<TotalProps>(
  ({ tanks }) => {
    const ratio = useAveragesExclusionRatio();
    const numberFormat = Intl.NumberFormat(undefined, { notation: 'compact' });
    const sum = useCallback(
      (slice: (tank: AverageDefinitionsAllStats) => number) => {
        return tanks.reduce(
          (acc, tank) => acc + tank.samples * slice(tank.mu),
          0,
        );
      },
      [tanks],
    );

    const players = sum(() => 1);
    const battles = sum(({ battles }) => battles);
    const winrate = sum(({ wins }) => wins) / battles;
    const damage = sum(({ damage_dealt }) => damage_dealt) / battles;
    const survival = sum(({ survived_battles }) => survived_battles) / battles;
    const xp = sum(({ xp }) => xp) / battles;
    const kills = sum(({ frags }) => frags) / battles;
    const spots = sum(({ spotted }) => spotted) / battles;
    const hits = sum(({ hits }) => hits) / battles;
    const shots = sum(({ shots }) => shots) / battles;
    const accuracy = hits / shots;
    const damageReceived =
      sum(({ damage_received }) => damage_received) / battles;
    const damageRatio = damage / damageReceived;
    const capturePoints = sum(({ capture_points }) => capture_points) / battles;

    return (
      <Table.Row>
        <Table.RowHeaderCell>Total</Table.RowHeaderCell>
        <Table.Cell align="center">{(winrate * 100).toFixed(1)}%</Table.Cell>
        <Table.Cell align="center">
          {numberFormat.format(ratio * players)}
        </Table.Cell>
        <Table.Cell align="center">
          {numberFormat.format(ratio * battles)}
        </Table.Cell>
        <Table.Cell align="center">
          {Math.round(damage).toLocaleString()}
        </Table.Cell>
        <Table.Cell align="center">
          {Math.round(survival * 100).toFixed(1)}%
        </Table.Cell>
        <Table.Cell align="center">
          {Math.round(xp).toLocaleString()}
        </Table.Cell>
        <Table.Cell align="center">{kills.toFixed(2)}</Table.Cell>
        <Table.Cell align="center">{spots.toFixed(2)}</Table.Cell>
        <Table.Cell align="center">{(accuracy * 100).toFixed(0)}%</Table.Cell>
        <Table.Cell align="center">{shots.toFixed(1)}</Table.Cell>
        <Table.Cell align="center">{hits.toFixed(1)}</Table.Cell>
        <Table.Cell align="center">{damageRatio.toFixed(2)}</Table.Cell>
        <Table.Cell align="center">
          {Math.round(damageReceived).toLocaleString()}
        </Table.Cell>
        <Table.Cell align="center">{capturePoints.toFixed(2)}</Table.Cell>
      </Table.Row>
    );
  },
  (prev, next) => prev.tanks === next.tanks,
);
