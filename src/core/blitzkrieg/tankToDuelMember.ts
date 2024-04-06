import { DuelMember } from '../../stores/duel';
import { genericDefaultEquipmentMatrix } from '../../stores/duel/constants';
import { availableProvisions } from './availableProvisions';
import { ProvisionDefinitions } from './provisionDefinitions';
import { TankDefinition } from './tankDefinitions';

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
      .filter((provision) => provision.crew !== undefined)
      .map((provision) => provision.id),
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
