import type { TankDefinition } from '@blitzkit/core';
import type { TankFilters } from '../../stores/tankFilters';

export function filterTank(filters: TankFilters, tank: TankDefinition) {
  return (
    (filters.tiers.length === 0 || filters.tiers.includes(tank.tier)) &&
    (filters.nations.length === 0 || filters.nations.includes(tank.nation)) &&
    (filters.classes.length === 0 || filters.classes.includes(tank.class)) &&
    (filters.types.length === 0 || filters.types.includes(tank.type)) &&
    (filters.testing === 'include' ||
      (filters.testing === 'only' && tank.testing) ||
      (filters.testing === 'exclude' && !tank.testing)) &&
    (filters.gunType.length === 0 ||
      (filters.gunType.includes('regular') &&
        tank.turrets.some((turret) =>
          turret.guns.some((gun) => gun.gun_type!.$case === 'regular'),
        )) ||
      (filters.gunType.includes('auto_loader') &&
        tank.turrets.some((turret) =>
          turret.guns.some((gun) => gun.gun_type!.$case === 'auto_loader'),
        )) ||
      (filters.gunType.includes('auto_reloader') &&
        tank.turrets.some((turret) =>
          turret.guns.some((gun) => gun.gun_type!.$case === 'auto_reloader'),
        ))) &&
    (filters.shells[0] === null ||
      tank.turrets.some((turret) =>
        turret.guns.some(
          (gun) =>
            gun.gun_type!.value.base.shells[0]?.type === filters.shells[0],
        ),
      )) &&
    (filters.shells[1] === null ||
      tank.turrets.some((turret) =>
        turret.guns.some(
          (gun) =>
            gun.gun_type!.value.base.shells[1]?.type === filters.shells[1],
        ),
      )) &&
    (filters.shells[2] === null ||
      tank.turrets.some((turret) =>
        turret.guns.some(
          (gun) =>
            gun.gun_type!.value.base.shells[2]?.type === filters.shells[2],
        ),
      ))
  );
}
