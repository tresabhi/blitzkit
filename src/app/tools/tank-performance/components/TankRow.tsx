import { Table } from '@radix-ui/themes';
import { memo, use } from 'react';
import { TankRowHeaderCell } from '../../../../components/TankRowHeaderCell';
import { averageDefinitions } from '../../../../core/blitzkit/averageDefinitions';
import { TankDefinition } from '../../../../core/blitzkit/tankDefinitions';
import { useAveragesExclusionRatio } from '../../../../hooks/useAveragesExclusionRatio';

interface TankRowProps {
  tank: TankDefinition;
}

export const TankRow = memo<TankRowProps>(
  ({ tank }) => {
    const awaitedAverageDefinitions = use(averageDefinitions);
    const averages = awaitedAverageDefinitions.averages[tank.id];
    const numberFormat = Intl.NumberFormat(undefined, { notation: 'compact' });
    const ratio = useAveragesExclusionRatio();

    return (
      <Table.Row>
        <TankRowHeaderCell tank={tank} />

        <Table.Cell align="center">
          {((averages.mu.wins / averages.mu.battles) * 100).toFixed(1)}%
        </Table.Cell>
        <Table.Cell align="center">
          {numberFormat.format(Math.round(ratio * averages.samples.d_30))}
        </Table.Cell>
        <Table.Cell align="center">
          {numberFormat.format(
            Math.round(ratio * averages.mu.battles * averages.samples.total),
          )}
        </Table.Cell>
        <Table.Cell align="center">
          {Math.round(
            averages.mu.damage_dealt / averages.mu.battles,
          ).toLocaleString()}
        </Table.Cell>
        <Table.Cell align="center">
          {Math.round(
            (averages.mu.survived_battles / averages.mu.battles) * 100,
          )}
          %
        </Table.Cell>
        <Table.Cell align="center">
          {Math.round(averages.mu.xp / averages.mu.battles).toLocaleString()}
        </Table.Cell>
        <Table.Cell align="center">
          {(averages.mu.frags / averages.mu.battles).toFixed(2)}
        </Table.Cell>
        <Table.Cell align="center">
          {(averages.mu.spotted / averages.mu.battles).toFixed(2)}
        </Table.Cell>
        <Table.Cell align="center">
          {Math.round((averages.mu.hits / averages.mu.shots) * 100)}%
        </Table.Cell>
        <Table.Cell align="center">
          {(averages.mu.shots / averages.mu.battles).toFixed(1)}
        </Table.Cell>
        <Table.Cell align="center">
          {(averages.mu.hits / averages.mu.battles).toFixed(1)}
        </Table.Cell>
        <Table.Cell align="center">
          {(averages.mu.damage_dealt / averages.mu.damage_received).toFixed(2)}
        </Table.Cell>
        <Table.Cell align="center">
          {Math.round(
            averages.mu.damage_received / averages.mu.battles,
          ).toLocaleString()}
        </Table.Cell>
        <Table.Cell align="center">
          {(averages.mu.capture_points / averages.mu.battles).toFixed(2)}
        </Table.Cell>
      </Table.Row>
    );
  },
  (prev, next) => prev.tank.id === next.tank.id,
);
