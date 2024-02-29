import { Euler, Quaternion, Vector3 } from 'three';
import { J_HAT } from '../../constants/axis';

const quaternion = new Quaternion();
const axis = new Vector3();

export function normalToEuler(normal: Vector3, up = J_HAT) {
  return new Euler().setFromQuaternion(
    quaternion.setFromAxisAngle(
      axis.crossVectors(up, normal).normalize(),
      up.angleTo(normal),
    ),
  );
}
