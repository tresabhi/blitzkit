import { Vector3, Vector3Tuple } from 'three';
import { I_HAT } from '../../constants/axis';

export function correctZYTuple(tuple: Vector3Tuple) {
  return new Vector3(tuple[0], tuple[1], -tuple[2]).applyAxisAngle(
    I_HAT,
    Math.PI / 2,
  );
}
