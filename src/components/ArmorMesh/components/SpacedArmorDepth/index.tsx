import { MeshProps } from '@react-three/fiber';
import { MeshStandardMaterial, WebGLRenderTarget } from 'three';
import ThreeCustomShaderMaterial from 'three-custom-shader-material';
import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';

export const spacedArmorDepthRenderTarget = new WebGLRenderTarget();

type ArmorMeshSpacedArmorDepthProps = MeshProps &
  (
    | {
        include?: false;
      }
    | {
        include: true;
        thickness: number;
        maxThickness: number;
      }
  );

export function ArmorMeshSpacedArmorDepth(
  props: ArmorMeshSpacedArmorDepthProps,
) {
  return (
    <>
      {!props.include && (
        <mesh {...props} renderOrder={0}>
          <meshBasicMaterial colorWrite={false} />
        </mesh>
      )}

      {props.include && (
        <mesh {...props} renderOrder={1}>
          <ThreeCustomShaderMaterial
            silent
            depthWrite={false}
            baseMaterial={MeshStandardMaterial}
            fragmentShader={fragmentShader}
            vertexShader={vertexShader}
            uniforms={{
              thickness: { value: props.thickness },
              maxThickness: { value: props.maxThickness },
            }}
          />
        </mesh>
      )}
    </>
  );
}
