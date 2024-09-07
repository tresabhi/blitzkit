import { ModelArmor } from '@blitzkit/core/src/blitzkit/modelDefinitions';

export function resolveArmor(armor: ModelArmor, index: number) {
  const spaced = armor.spaced?.includes(index) ?? false;
  const thickness = index === -1 ? 0 : armor.thickness[index] ?? 0;

  return { spaced, thickness };
}
