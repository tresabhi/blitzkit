import { DuelMember } from '../../stores/duel';
import { genericDefaultEquipmentMatrix } from '../../stores/duel/constants';
import { TankDefinition } from './tankDefinitions';

export function tankToDuelMember(tank: TankDefinition) {
  return {
    camouflage: true,
    consumables: [],
    equipmentMatrix: genericDefaultEquipmentMatrix,
    cooldownBooster: 0,
    crewMastery: 1,
    provisions: [],
    engine: tank.engines.at(-1)!,
    gun: tank.turrets.at(-1)!.guns.at(-1)!,
    shell: tank.turrets.at(-1)!.guns.at(-1)!.shells[0],
    tank,
    track: tank.tracks.at(-1)!,
    yaw: 0,
    pitch: 0,
    turret: tank.turrets.at(-1)!,
  } satisfies DuelMember;
}
