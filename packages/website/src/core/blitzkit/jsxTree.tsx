import type { MeshProps, Object3DProps } from '@react-three/fiber';
import type { ReactNode } from 'react';
import { Mesh, Object3D } from 'three';

export function jsxTree(
  node: Object3D,
  mergers?: {
    mesh?: (mesh: Mesh, props: MeshProps) => ReactNode;
    group?: (object3d: Object3D, props: Object3DProps) => ReactNode;
  },
): ReactNode {
  if (node instanceof Mesh) {
    const props = {
      key: node.uuid,
      geometry: node.geometry,
      material: node.material,
      position: node.position,
      rotation: node.rotation,
      scale: node.scale,
    };

    return mergers?.mesh ? mergers.mesh(node, props) : <mesh {...props} />;
  } else if (node instanceof Object3D) {
    const props = {
      key: node.uuid,
      position: node.position,
      rotation: node.rotation,
      scale: node.scale,
      children: node.children.map((child) => jsxTree(child, mergers)),
    };

    return mergers?.group ? mergers.group(node, props) : <group {...props} />;
  }

  return null;
}
