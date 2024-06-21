import { TankopediaFilters } from '../../stores/tankopediaFilters';
import { TankDefinition } from './tankDefinitions';

export function tankopediaFilterTank(
  filters: TankopediaFilters,
  tank: TankDefinition,
) {
  return (
    (filters.tier === undefined || filters.tier === tank.tier) &&
    (filters.nation === undefined || filters.nation === tank.nation) &&
    (filters.class === undefined || filters.class === tank.class) &&
    (filters.type === undefined || filters.type === tank.treeType) &&
    (filters.testing === 'include' ||
      (filters.testing === 'only' && tank.testing) ||
      (filters.testing === 'exclude' && !tank.testing))
  );
}
