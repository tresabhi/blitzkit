import {
  MeshBasicMaterial,
  Object3D,
  ShaderMaterial,
  WebGLRenderTarget,
} from 'three';
import { jsxTree } from '../../../../core/blitzkrieg/jsxTree';
import { ArmorMeshUserData } from '../Armor';
import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';

export const spacedArmorDepthRenderTarget = new WebGLRenderTarget();

type ArmorMeshSpacedArmorDepthProps = {
  ornamental?: boolean;
  node: Object3D;
} & (
  | {
      include?: false;
      isExternalModule: boolean;
    }
  | {
      include: true;
      thickness: number;
      maxThickness: number;
    }
);

const excludeMaterial = new MeshBasicMaterial({
  colorWrite: false,
});
const includeMaterial = new MeshBasicMaterial({
  colorWrite: false,
  depthWrite: false,
});

export function ArmorMeshSpacedArmorDepth({
  ornamental = false,
  node,
  ...props
}: ArmorMeshSpacedArmorDepthProps) {
  return (
    <>
      {!props.include &&
        !ornamental &&
        jsxTree(node, {
          renderOrder: props.isExternalModule ? 2 : 0,
          material: excludeMaterial,
        })}

      {props.include &&
        jsxTree(node, {
          renderOrder: 1,
          onClick: ornamental ? () => {} : undefined,
          userData: {
            type: 'spacedArmor',
            thickness: props.thickness,
          } satisfies ArmorMeshUserData,
          material: ornamental
            ? includeMaterial
            : new ShaderMaterial({
                fragmentShader,
                vertexShader,
                uniforms: {
                  thickness: { value: props.thickness },
                  maxThickness: { value: props.maxThickness },
                },
              }),
        })}
    </>
  );
}
