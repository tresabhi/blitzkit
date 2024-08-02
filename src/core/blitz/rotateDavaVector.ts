import { Vector3 } from 'three';
import { I_HAT } from '../../constants/axis';

export function rotateDavaVector(vector: Vector3) {
  return vector.applyAxisAngle(I_HAT, Math.PI / 2);
}
