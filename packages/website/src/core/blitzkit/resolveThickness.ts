import type { ModelArmor } from '@blitzkit/core';

export function resolveArmor(armor: ModelArmor, index: number) {
  const spaced = armor.spaced?.includes(index) ?? false;
  const thickness = index === -1 ? 0 : (armor.thickness[index] ?? 0);

  return { spaced, thickness };
}
