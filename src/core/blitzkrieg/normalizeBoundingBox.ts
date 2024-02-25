import { Vector3Tuple } from 'three';
import { BoundingBox } from './modelDefinitions';

export function normalizeBoundingBox(boundingBox: BoundingBox) {
  return boundingBox.max.map(
    (max, index) => max - boundingBox.min[index],
  ) as Vector3Tuple;
}
