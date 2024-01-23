import { MeshProps } from '@react-three/fiber';
import { WebGLRenderTarget } from 'three';
import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';

export const spacedArmorDepthRenderTarget = new WebGLRenderTarget();

type ArmorMeshSpacedArmorDepthProps = MeshProps &
  (
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

export function ArmorMeshSpacedArmorDepth(
  props: ArmorMeshSpacedArmorDepthProps,
) {
  return (
    <>
      {!props.include && (
        <mesh {...props} renderOrder={props.isExternalModule ? 2 : 0}>
          <meshBasicMaterial colorWrite={false} />
        </mesh>
      )}

      {props.include && (
        <mesh {...props} renderOrder={1}>
          <shaderMaterial
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
