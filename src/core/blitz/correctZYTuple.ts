import { Vector3, Vector3Tuple } from 'three';
import { rotateDavaVector } from './rotateDavaVector';

export function correctZYTuple(tuple: Vector3Tuple) {
  return rotateDavaVector(new Vector3(tuple[0], tuple[1], -tuple[2]));
}
