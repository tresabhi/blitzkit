'use client';

import { Table } from '@radix-ui/themes';
import { times } from 'lodash';
import { Suspense, use, useEffect, useMemo, useState } from 'react';
import { averageDefinitionsArray } from '../../../../core/blitzkit/averageDefinitions';
import { filterTank } from '../../../../core/blitzkit/filterTank';
import { tankDefinitions } from '../../../../core/blitzkit/tankDefinitions';
import * as TankFilters from '../../../../stores/tankFilters';
import * as TankPerformancePersistent from '../../../../stores/tankPerformancePersistent';
import * as TankPerformanceSort from '../../../../stores/tankPerformanceSort';
import { RowLoader } from './RowLoader';
import { TankRow } from './TankRow';
import { Total } from './Total';

const PREVIEW_COUNT = 10;
const DEFAULT_LOADED_ROWS = 25;

export function Tanks() {
  const awaitedTankDefinitions = use(tankDefinitions);
  const awaitedAverageDefinitionsArray = use(averageDefinitionsArray);
  const filters = TankFilters.use();
  const sort = TankPerformanceSort.use();
  const tankPerformancePersistentStore = TankPerformancePersistent.useStore();
  const tanksSorted = useMemo(() => {
    const { playerCountPeriod } = tankPerformancePersistentStore.getState();

    switch (sort.type) {
      case 'accuracy':
        return awaitedAverageDefinitionsArray.sort(
          (a, b) =>
            sort.direction * (a.mu.hits / a.mu.shots - b.mu.hits / b.mu.shots),
        );
      case 'capturePoints':
        return awaitedAverageDefinitionsArray.sort(
          (a, b) =>
            sort.direction *
            (a.mu.capture_points / a.mu.battles -
              b.mu.capture_points / b.mu.battles),
        );
      case 'damage':
        return awaitedAverageDefinitionsArray.sort(
          (a, b) =>
            sort.direction *
            (a.mu.damage_dealt / a.mu.battles -
              b.mu.damage_dealt / b.mu.battles),
        );
      case 'damageRatio':
        return awaitedAverageDefinitionsArray.sort(
          (a, b) =>
            sort.direction *
            (a.mu.damage_dealt / a.mu.damage_received -
              b.mu.damage_dealt / b.mu.damage_received),
        );
      case 'damageTaken':
        return awaitedAverageDefinitionsArray.sort(
          (a, b) =>
            sort.direction *
            (a.mu.damage_received / a.mu.battles -
              b.mu.damage_received / b.mu.battles),
        );
      case 'hits':
        return awaitedAverageDefinitionsArray.sort(
          (a, b) =>
            sort.direction *
            (a.mu.hits / a.mu.battles - b.mu.hits / b.mu.battles),
        );
      case 'kills':
        return awaitedAverageDefinitionsArray.sort(
          (a, b) =>
            sort.direction *
            (a.mu.frags / a.mu.battles - b.mu.frags / b.mu.battles),
        );
      case 'shots':
        return awaitedAverageDefinitionsArray.sort(
          (a, b) =>
            sort.direction *
            (a.mu.shots / a.mu.battles - b.mu.shots / b.mu.battles),
        );
      case 'players':
        return awaitedAverageDefinitionsArray.sort(
          (a, b) =>
            sort.direction *
            (a.samples[playerCountPeriod] - b.samples[playerCountPeriod]),
        );
      case 'spots':
        return awaitedAverageDefinitionsArray.sort(
          (a, b) =>
            sort.direction *
            (a.mu.spotted / a.mu.battles - b.mu.spotted / b.mu.battles),
        );
      case 'survival':
        return awaitedAverageDefinitionsArray.sort(
          (a, b) =>
            sort.direction *
            (a.mu.survived_battles / a.mu.battles -
              b.mu.survived_battles / b.mu.battles),
        );
      case 'winrate':
        return awaitedAverageDefinitionsArray.sort(
          (a, b) =>
            sort.direction *
            (a.mu.wins / a.mu.battles - b.mu.wins / b.mu.battles),
        );
      case 'xp':
        return awaitedAverageDefinitionsArray.sort(
          (a, b) =>
            sort.direction * (a.mu.xp / a.mu.battles - b.mu.xp / b.mu.battles),
        );
    }
  }, [sort]);
  const tanks = useMemo(() => {
    return tanksSorted.filter((tank) =>
      filterTank(filters, awaitedTankDefinitions[tank.id]),
    );
  }, [filters, sort]);
  const [loadedRows, setLoadedRows] = useState(DEFAULT_LOADED_ROWS);

  useEffect(() => {
    setLoadedRows(DEFAULT_LOADED_ROWS);
  }, [filters, sort]);

  return (
    <Table.Body>
      <Total tanks={tanks} />

      {tanks.slice(0, loadedRows).map((averages) => {
        const tank = awaitedTankDefinitions[averages.id];

        if (tank === undefined) return null;

        return (
          <Suspense key={tank.id} fallback={<RowLoader />}>
            <TankRow tank={tank} />
          </Suspense>
        );
      })}

      {times(Math.min(PREVIEW_COUNT, tanks.length - loadedRows), (index) => {
        return (
          <RowLoader
            key={index}
            onIntersection={() => {
              setLoadedRows((state) => Math.min(state + 2, tanks.length));
            }}
          />
        );
      })}
    </Table.Body>
  );
}
