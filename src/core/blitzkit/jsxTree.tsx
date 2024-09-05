import { GroupProps, MeshProps } from '@react-three/fiber';
import { Mesh, Object3D } from 'three';

export function jsxTree(
  node: Object3D,
  mergers?: {
    mesh?: MeshProps | ((mesh: Mesh) => MeshProps);
    group?: GroupProps | ((object3d: Object3D) => GroupProps);
  },
  key?: string,
) {
  if (node instanceof Mesh) {
    return (
      <mesh
        key={key}
        geometry={node.geometry}
        material={node.material}
        position={node.position}
        rotation={node.rotation}
        scale={node.scale}
        {...(mergers?.mesh &&
          (typeof mergers.mesh === 'function'
            ? mergers.mesh(node)
            : mergers.mesh))}
      />
    );
  } else if (node instanceof Object3D) {
    return (
      <group
        key={key}
        position={node.position}
        rotation={node.rotation}
        scale={node.scale}
        {...(mergers?.group &&
          (typeof mergers.group === 'function'
            ? mergers.group(node)
            : mergers.group))}
      >
        {node.children.map((child) => jsxTree(child, mergers, child.uuid))}
      </group>
    );
  }

  return null;
}
