import {
  availableProvisions,
  ProvisionDefinitions,
  TankDefinition,
} from '@blitzkit/core';
import { DuelMember } from '../../stores/duel';
import { genericDefaultEquipmentMatrix } from '../../stores/duel/constants';

const PROVISION_PREFERENCES = [
  19, // improved fuel
  18, // standard fuel
  22, // protective kit
];

function infinityFallback(value: number) {
  return value === -1 ? Infinity : value;
}

export function tankToDuelMember(
  tank: TankDefinition,
  provisionDefinitions: ProvisionDefinitions,
) {
  const turret = tank.turrets.at(-1)!;
  const gun = turret.guns.at(-1)!;
  const provisionsList = availableProvisions(tank, gun, provisionDefinitions);

  return {
    camouflage: true,
    consumables: [],
    equipmentMatrix: genericDefaultEquipmentMatrix,
    cooldownBooster: 0,
    crewMastery: 1,
    provisions: provisionsList
      .sort(
        (a, b) =>
          infinityFallback(PROVISION_PREFERENCES.indexOf(a.id)) -
          infinityFallback(PROVISION_PREFERENCES.indexOf(b.id)),
      )
      .sort((a, b) => (b.crew ?? 0) - (a.crew ?? 0))
      .slice(0, tank.provisions)
      .map(({ id }) => id),
    engine: tank.engines.at(-1)!,
    gun,
    shell: tank.turrets.at(-1)!.guns.at(-1)!.shells[0],
    tank,
    track: tank.tracks.at(-1)!,
    yaw: 0,
    pitch: 0,
    turret,
  } satisfies DuelMember;
}
