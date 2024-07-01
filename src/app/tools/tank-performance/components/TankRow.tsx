import { Table } from '@radix-ui/themes';
import { memo, use, useMemo } from 'react';
import { TankRowHeaderCell } from '../../../../components/TankRowHeaderCell';
import { averageDefinitions } from '../../../../core/blitzkit/averageDefinitions';
import { TankDefinition } from '../../../../core/blitzkit/tankDefinitions';

interface TankRowProps {
  tank: TankDefinition;
}

export const TankRow = memo<TankRowProps>(
  ({ tank }) => {
    const awaitedAverageDefinitions = use(averageDefinitions);
    const averages = awaitedAverageDefinitions.averages[tank.id];
    const numberFormat = useMemo(
      () => Intl.NumberFormat(undefined, { notation: 'compact' }),
      [],
    );

    return (
      <Table.Row>
        <TankRowHeaderCell tank={tank} />
        <Table.Cell align="center">
          {Math.round(averages.mu.wins * 100)}%
        </Table.Cell>
        <Table.Cell align="center">
          {numberFormat.format(Math.round(averages.samples))}
        </Table.Cell>
        <Table.Cell align="center">
          {Math.round(averages.mu.damage_dealt).toLocaleString()}
        </Table.Cell>
        <Table.Cell align="center">
          {Math.round(averages.mu.survived_battles * 100)}%
        </Table.Cell>
        <Table.Cell align="center">
          {Math.round(averages.mu.xp).toLocaleString()}
        </Table.Cell>
        <Table.Cell align="center">{averages.mu.frags.toFixed(2)}</Table.Cell>
        <Table.Cell align="center">{averages.mu.spotted.toFixed(2)}</Table.Cell>
        <Table.Cell align="center">
          {Math.round((averages.mu.hits / averages.mu.shots) * 100)}%
        </Table.Cell>
        <Table.Cell align="center">{averages.mu.shots.toFixed(1)}</Table.Cell>
        <Table.Cell align="center">{averages.mu.hits.toFixed(1)}</Table.Cell>
        <Table.Cell align="center">
          {(averages.mu.damage_dealt / averages.mu.damage_received).toFixed(2)}
        </Table.Cell>
        <Table.Cell align="center">
          {Math.round(averages.mu.damage_received).toLocaleString()}
        </Table.Cell>
        <Table.Cell align="center">
          {averages.mu.capture_points.toFixed(2)}
        </Table.Cell>
      </Table.Row>
    );
  },
  (prev, next) => prev.tank.id === next.tank.id,
);
