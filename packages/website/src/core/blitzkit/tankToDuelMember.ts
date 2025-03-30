import { Tank } from '@blitzkit/core';
import type { DuelMember } from '../../stores/duel';

export function tankToDuelMember(
  tank: Tank,
  // provisionDefinitions: ProvisionDefinitions,
) {
  const turret = Object.values(tank.turrets).at(-1)!;
  const gun = Object.values(tank.guns).at(-1)!;

  return {
    // camouflage: true,
    // consumables: [],
    // equipmentMatrix: genericDefaultEquipmentMatrix,
    // cooldownBooster: 0,
    // provisions: createDefaultProvisions(tank, gun, provisionDefinitions),
    // engine: tank.engines.at(-1)!,
    gun,
    // shell: tank.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.shells[0],
    tank,
    // track: tank.tracks.at(-1)!,
    // yaw: 0,
    // pitch: 0,
    turret,
  } satisfies DuelMember;
}
