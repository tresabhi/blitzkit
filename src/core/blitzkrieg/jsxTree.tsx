import { MeshProps } from '@react-three/fiber';
import { Mesh, Object3D } from 'three';

export function jsxTree(node: Object3D, mesh?: MeshProps) {
  if (node instanceof Mesh) {
    return (
      <mesh
        geometry={node.geometry}
        material={node.material}
        position={node.position}
        rotation={node.rotation}
        scale={node.scale}
        {...mesh}
      />
    );
  } else if (node instanceof Object3D) {
    return (
      <group
        position={node.position}
        rotation={node.rotation}
        scale={node.scale}
      >
        {node.children.map((child) => jsxTree(child, mesh))}
      </group>
    );
  }

  return null;
}
