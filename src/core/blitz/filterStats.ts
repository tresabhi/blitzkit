// BIG TODO: reorganize code folder

import { TreeTypeString } from '../../components/Tanks';
import { DiffedTankStats } from '../blitzstars/getDiffedTankStats';
import { tankAverages } from '../blitzstars/tankAverages';
import calculateWN8 from './calculateWN8';
import sumStats from './sumStats';
import { tankopedia } from './tankopedia';

export interface StatFilters {
  nation?: string;
  tier?: number;
  tankType?: string;
  treeType?: TreeTypeString;
  tank?: number;
}

export async function filterStats(
  { diff, order }: DiffedTankStats,
  filters: StatFilters,
) {
  // tank, if provided, takes priority over all other filters
  if (filters.tank) filters = { tank: filters.tank };

  const awaitedTankopedia = await tankopedia;
  const awaitedTankAverages = await tankAverages;
  const filteredOrder = order.filter((id) => {
    const entry = awaitedTankopedia[id];

    return (
      entry &&
      (filters.nation === undefined || entry.nation === filters.nation) &&
      (filters.tier === undefined || entry.tier === filters.tier) &&
      (filters.tankType === undefined || entry.type === filters.tankType) &&
      (filters.treeType === undefined ||
        (filters.treeType === 'collector' && entry.is_collectible) ||
        (filters.treeType === 'premium' &&
          entry.is_premium &&
          !entry.is_collectible) ||
        (filters.treeType === 'tech-tree' &&
          !entry.is_collectible &&
          !entry.is_premium)) &&
      (filters.tank === undefined || entry.tank_id === filters.tank)
    );
  });
  const stats = sumStats(filteredOrder.map((id) => diff[id]));
  const battlesOfTanksWithAverages = filteredOrder.reduce<number>(
    (accumulator, id) =>
      awaitedTankAverages[id] ? accumulator + diff[id].battles : accumulator,
    0,
  );
  const battlesOfTanksWithTankopediaEntry = filteredOrder.reduce<number>(
    (accumulator, id) =>
      awaitedTankopedia[id] ? accumulator + diff[id].battles : accumulator,
    0,
  );
  const supplementary = {
    WN8:
      filteredOrder.reduce<number>(
        (accumulator, id) =>
          awaitedTankAverages[id]
            ? accumulator +
              calculateWN8(awaitedTankAverages[id].all, diff[id]) *
                diff[id].battles
            : accumulator,
        0,
      ) / battlesOfTanksWithAverages,
    tier:
      filteredOrder.reduce<number>(
        (accumulator, id) =>
          awaitedTankopedia[id]
            ? accumulator + awaitedTankopedia[id]!.tier * diff[id].battles
            : accumulator,
        0,
      ) / battlesOfTanksWithTankopediaEntry,
  };

  return { stats, supplementary };
}
