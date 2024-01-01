import { Mesh, Object3D } from 'three';

export function resolveJsxTree(parent: Object3D) {
  return parent.children.map((child) => {
    if (child.type === 'Mesh') {
      return (
        <mesh
          key={child.uuid}
          castShadow
          receiveShadow
          geometry={(child as Mesh).geometry}
          material={(child as Mesh).material}
          position={child.position}
          rotation={child.rotation}
          scale={child.scale}
          children={resolveJsxTree(child)}
        />
      );
    }
    if (child.type === 'Object3D') {
      return (
        <group
          key={child.uuid}
          position={child.position}
          rotation={child.rotation}
          scale={child.scale}
          children={resolveJsxTree(child)}
        />
      );
    }

    throw new TypeError(
      `Unhandled three jsx type ${child.type} (${child.name})`,
    );
  });
}
