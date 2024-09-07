import { ProvisionDefinitions } from '@blitzkit/core/src/blitzkit/provisionDefinitions';
import { checkConsumableProvisionInclusivity } from './checkConsumableProvisionInclusivity';
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
