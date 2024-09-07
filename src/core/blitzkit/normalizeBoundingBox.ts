import { BoundingBox } from '@blitzkit/core/src/blitzkit/modelDefinitions';
import { Vector3Tuple } from 'three';

export function normalizeBoundingBox(boundingBox: BoundingBox) {
  return boundingBox.max.map(
    (max, index) => max - boundingBox.min[index],
  ) as Vector3Tuple;
}
