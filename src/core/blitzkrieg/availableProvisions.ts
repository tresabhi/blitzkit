import { checkConsumableProvisionInclusivity } from './checkConsumableProvisionInclusivity';
import { ProvisionDefinitions } from './provisionDefinitions';
import { GunDefinition, TankDefinition } from './tankDefinitions';

export function availableProvisions(
  tank: TankDefinition,
  gun: GunDefinition,
  provisionDefinitions: ProvisionDefinitions,
) {
  return Object.values(provisionDefinitions).filter((provision) =>
    checkConsumableProvisionInclusivity(provision, tank, gun),
  );
}
