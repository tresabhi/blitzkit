import { Material, Mesh, Object3D, Vector3 } from 'three';

export function discardClippingPlane(object: Object3D, point: Vector3) {
  if (
    object instanceof Mesh &&
    object.material instanceof Material &&
    object.material.clippingPlanes !== null
  ) {
    return object.material.clippingPlanes.every(
      (plane) => plane.distanceToPoint(point) < 0,
    );
  }

  return false;
}
