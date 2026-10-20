import type { ReactNode } from "react";
import type { Material, Object3D } from "three";
import type { Skin } from "../../hooks/useSkin";
import { jsxTree } from "./jsxTree";

type Mergers = NonNullable<Parameters<typeof jsxTree>[1]> & {
  /** renders a customization part as is so its animations play */
  primitive?: (object: Object3D, key: string) => ReactNode;
};

export function skinTree(
  node: Object3D,
  skin: Skin | undefined,
  mergers: Mergers,
) {
  const skinMergers: Mergers = {
    mesh(mesh, props, key) {
      const material = skin?.materials.get((mesh.material as Material).name);

      return mergers!.mesh!(
        mesh,
        material ? { ...props, material } : props,
        key,
      );
    },
    group(object3d, props, key) {
      const parts = skin?.parts.get(object3d.name);
      const isSwitch = object3d.userData.state !== undefined;
      const state = skin
        ? skin.scene.userData.states[object3d.name]
        : object3d.userData.state;

      return (
        <group key={key} {...props}>
          {isSwitch
            ? object3d.children
                .filter((child) => child.name === state)
                .map((child) => jsxTree(child, skinMergers))
            : props.children}
          {parts?.map((part) =>
            mergers.primitive ? (
              mergers.primitive(part, part.uuid)
            ) : (
              <primitive key={part.uuid} object={part} />
            ),
          )}
        </group>
      );
    },
  };

  return jsxTree(node, skinMergers);
}
