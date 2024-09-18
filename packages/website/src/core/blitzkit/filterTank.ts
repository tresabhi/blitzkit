import type { TankDefinition } from '@blitzkit/core';
import type { TankFilters } from '../../stores/tankFilters';

export function filterTank(filters: TankFilters, tank: TankDefinition) {
  return (
    (filters.tiers.length === 0 || filters.tiers.includes(tank.tier)) &&
    (filters.nations.length === 0 || filters.nations.includes(tank.nation)) &&
    (filters.classes.length === 0 || filters.classes.includes(tank.class)) &&
    (filters.types.length === 0 || filters.types.includes(tank.treeType)) &&
    (filters.testing === 'include' ||
      (filters.testing === 'only' && tank.testing) ||
      (filters.testing === 'exclude' && !tank.testing))
  );
}
