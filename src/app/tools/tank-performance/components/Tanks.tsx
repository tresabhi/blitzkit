'use client';

import { Table } from '@radix-ui/themes';
import { Suspense, use, useMemo } from 'react';
import { averageDefinitionsArray } from '../../../../core/blitzkit/averageDefinitions';
import { tankDefinitions } from '../../../../core/blitzkit/tankDefinitions';
import { RowLoader } from './RowLoader';
import { TankRow } from './TankRow';

export function Tanks() {
  const awaitedTankDefinitions = use(tankDefinitions);
  const awaitedAverageDefinitionsArray = use(averageDefinitionsArray);
  const tankAverages = useMemo(
    () =>
      awaitedAverageDefinitionsArray.sort(
        (a, b) => b.mu.wins / b.mu.battles - a.mu.wins / a.mu.battles,
      ),
    [],
  );

  return (
    <Table.Body>
      {tankAverages.map((averages) => {
        const tank = awaitedTankDefinitions[averages.id];
        return (
          <Suspense key={tank.id} fallback={<RowLoader />}>
            <TankRow tank={tank} />
          </Suspense>
        );
      })}
    </Table.Body>
  );
}
