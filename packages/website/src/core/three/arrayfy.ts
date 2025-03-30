import type { Vector3 } from '@blitzkit/core';

export function arrayfy(vector: Vector3) {
  return [vector.x, vector.y, vector.z] as const;
}
