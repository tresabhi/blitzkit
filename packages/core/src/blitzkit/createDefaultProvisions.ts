import { GunDefinition, ProvisionDefinitions, TankDefinition } from '../protos';
import { availableProvisions } from './availableProvisions';

const PROVISION_PREFERENCES = [
  19, // improved fuel
  18, // standard fuel
  22, // protective kit
];

function infinityFallback(value: number) {
  return value === -1 ? Infinity : value;
}

export function createDefaultProvisions(
  tank: TankDefinition,
  gun: GunDefinition,
  provisionDefinitions: ProvisionDefinitions,
) {
  const provisionsList = availableProvisions(tank, gun, provisionDefinitions);

  return provisionsList
    .sort(
      (a, b) =>
        infinityFallback(PROVISION_PREFERENCES.indexOf(a.id)) -
        infinityFallback(PROVISION_PREFERENCES.indexOf(b.id)),
    )
    .sort((a, b) => (b.crew ?? 0) - (a.crew ?? 0))
    .slice(0, tank.max_provisions)
    .map(({ id }) => id);
}
