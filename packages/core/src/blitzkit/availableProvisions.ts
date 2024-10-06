import {
  GunDefinition,
  ProvisionDefinitions,
  TankDefinition,
} from '@blitzkit/core';
import { checkConsumableProvisionInclusivity } from './checkConsumableProvisionInclusivity';

export function availableProvisions(
  tank: TankDefinition,
  gun: GunDefinition,
  provisionDefinitions: ProvisionDefinitions,
) {
  return Object.values(provisionDefinitions).filter((provision) =>
    checkConsumableProvisionInclusivity(provision, tank, gun),
  );
}
