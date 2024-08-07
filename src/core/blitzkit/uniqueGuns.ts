import { forEachRight } from 'lodash';
import { GunDefinition, TurretDefinition } from './tankDefinitions';

export function uniqueGuns(turrets: TurretDefinition[]) {
  const gunIds = new Set<number>();
  const guns: { turret: TurretDefinition; gun: GunDefinition }[] = [];

  forEachRight(turrets, (turret) => {
    forEachRight(turret.guns, (gun) => {
      if (!gunIds.has(gun.id)) {
        gunIds.add(gun.id);
        guns.push({ turret, gun });
      }
    });
  });

  return guns;
}
