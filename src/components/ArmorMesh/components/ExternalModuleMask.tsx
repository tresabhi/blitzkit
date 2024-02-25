import { Color, MeshBasicMaterial, Object3D, WebGLRenderTarget } from 'three';
import { jsxTree } from '../../../core/blitzkrieg/jsxTree';
import { ArmorMeshUserData } from './Armor';

export const externalModuleMaskRenderTarget = new WebGLRenderTarget();

type ArmorMeshExternalModuleMaskProps = {
  ornamental?: boolean;
  node: Object3D;
} & (
  | {
      exclude?: false;
      maxThickness: number;
      thickness: number;
    }
  | {
      exclude: true;
    }
);

const excludeMaterial = new MeshBasicMaterial({
  colorWrite: false,
});

export function ArmorMeshExternalModuleMask({
  ornamental = false,
  node,
  ...props
}: ArmorMeshExternalModuleMaskProps) {
  return (
    <>
      {props.exclude &&
        !ornamental &&
        jsxTree(node, { renderOrder: 0, material: excludeMaterial })}

      {!props.exclude &&
        jsxTree(node, {
          renderOrder: 1,
          onClick: ornamental ? () => {} : undefined,
          userData: {
            type: 'externalModule',
            thickness: props.thickness,
          } satisfies ArmorMeshUserData,
          material: new MeshBasicMaterial({
            color: new Color(1, props.thickness / props.maxThickness, 0),
            depthWrite: false,
            colorWrite: !ornamental,
          }),
        })}
    </>
  );
}
