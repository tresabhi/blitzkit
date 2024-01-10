import { Vector2Tuple } from 'three';

export function numericPenetration(penetration: number | Vector2Tuple) {
  return typeof penetration === 'number' ? penetration : penetration[0];
}
