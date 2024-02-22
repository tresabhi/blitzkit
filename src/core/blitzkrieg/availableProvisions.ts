import { checkConsumableProvisionInclusivity } from './checkConsumableProvisionInclusivity';
import { provisionDefinitions } from './provisionDefinitions';
import { GunDefinition, TankDefinition } from './tankDefinitions';

export async function availableProvisions(
  tank: TankDefinition,
  gun: GunDefinition,
) {
  return Object.values(await provisionDefinitions).filter((provision) =>
    checkConsumableProvisionInclusivity(provision, tank, gun),
  );
}
