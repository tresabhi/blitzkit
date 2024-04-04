import { degToRad } from 'three/src/math/MathUtils';
import { DuelMember, mutateDuel } from '../../stores/duel';
import { genericDefaultEquipmentMatrix } from '../../stores/duel/constants';
import { availableProvisions } from './availableProvisions';
import { modelDefinitions } from './modelDefinitions';
import { provisionDefinitions } from './provisionDefinitions';
import { tankDefinitions } from './tankDefinitions';

export async function assignDuelMember(
  type: 'antagonist' | 'protagonist' | 'both',
  id: number,
) {
  const awaitedTankDefinitions = await tankDefinitions;
  const awaitedProvisionDefinitions = await provisionDefinitions;
  const awaitedModelDefinitions = await modelDefinitions;
  const tankModelDefinition = awaitedModelDefinitions[id];
  const tank = awaitedTankDefinitions[id];
  const turret = tank.turrets.at(-1)!;
  const gun = turret.guns.at(-1)!;
  const shell = gun.shells[0];
  const engine = tank.engines.at(-1)!;
  const track = tank.tracks.at(-1)!;
  const provisionsList = availableProvisions(
    tank,
    gun,
    awaitedProvisionDefinitions,
  );
  const member: DuelMember = {
    tank,
    engine,
    turret,
    gun,
    shell,
    track,
    equipmentMatrix: genericDefaultEquipmentMatrix,
    pitch: degToRad(tankModelDefinition.turretRotation?.pitch ?? 0),
    yaw: 0,
    camouflage: true,
    consumables: [],
    cooldownBooster: 0,
    crewMastery: 1,
    provisions: provisionsList
      .filter((provision) => provision.crew !== undefined)
      .map((provision) => provision.id),
  };

  mutateDuel((draft) => {
    draft.assigned = true;
    if (type === 'antagonist') {
      draft.antagonist = member;
    } else if (type === 'protagonist') {
      draft.protagonist = member;
    } else {
      draft.protagonist = member;
      draft.antagonist = { ...member };
    }
  });
}
