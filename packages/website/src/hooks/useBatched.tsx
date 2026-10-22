import type { ObjectMap } from "@react-three/fiber";
import type { ComponentProps } from "react";
import {
  BatchedMesh,
  Group,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
} from "three";

interface BatchedProps extends ComponentProps<"group"> {
  slicer: (node: Object3D) => boolean;
  mutator?: (mesh: Mesh) => void;
}

export function useBatched(map: ObjectMap, shadows = false) {
  return function Batched({ slicer, mutator, ...props }: BatchedProps) {
    const groups = new Map<
      MeshStandardMaterial,
      { clonedMaterial: MeshStandardMaterial; meshes: Mesh[] }
    >();

    for (const node of Object.values(map.nodes)) {
      if (!slicer(node)) continue;

      node.traverse((object) => {
        if (!(object instanceof Mesh)) return;

        const originalMaterial = object.material;

        if (!(originalMaterial instanceof MeshStandardMaterial)) return;

        let group = groups.get(originalMaterial);

        if (!group) {
          group = {
            clonedMaterial: originalMaterial.clone(),
            meshes: [],
          };
          groups.set(originalMaterial, group);
        }

        group.meshes.push(object);
      });
    }

    const wrapper = new Group();

    for (const { clonedMaterial: material, meshes } of groups.values()) {
      let vertices = 0;
      let indices = 0;

      for (const mesh of meshes) {
        vertices += mesh.geometry.attributes.position.count;
        indices += mesh.geometry.index!.count;
      }

      const batched = new BatchedMesh(
        meshes.length,
        vertices,
        indices,
        material,
      );

      for (const mesh of meshes) {
        const geometryId = batched.addGeometry(mesh.geometry);
        const instanceId = batched.addInstance(geometryId);

        mesh.updateWorldMatrix(true, false);
        batched.setMatrixAt(instanceId, mesh.matrixWorld);

        if (shadows) {
          batched.castShadow = true;
          batched.receiveShadow = true;
        }

        mutator?.(mesh);
      }

      wrapper.add(batched);
    }

    return (
      <group {...props}>
        <primitive object={wrapper} />
      </group>
    );
  };
}
