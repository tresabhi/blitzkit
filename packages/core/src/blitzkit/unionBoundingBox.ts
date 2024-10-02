import { BoundingBox } from '@blitzkit/core';

export function unionBoundingBox(a: BoundingBox, b: BoundingBox) {
  return {
    // min: a.min.map((a, index) => Math.min(a, b.min[index])) as Vector3Tuple,
    // max: a.max.map((a, index) => Math.max(a, b.max[index])) as Vector3Tuple,
    min: {
      x: Math.min(a.min.x, b.min.x),
      y: Math.min(a.min.y, b.min.y),
      z: Math.min(a.min.z, b.min.z),
    },
  } satisfies BoundingBox;
}
