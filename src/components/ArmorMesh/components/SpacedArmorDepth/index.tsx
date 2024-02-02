import { MeshProps } from '@react-three/fiber';
import { WebGLRenderTarget } from 'three';
import { ArmorMeshUserData } from '../Armor';
import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';

export const spacedArmorDepthRenderTarget = new WebGLRenderTarget();

type ArmorMeshSpacedArmorDepthProps = MeshProps & {
  ornamental?: boolean;
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

export function ArmorMeshSpacedArmorDepth({
  ornamental = false,
  ...props
}: ArmorMeshSpacedArmorDepthProps) {
  return (
    <>
      {!props.include && !ornamental && (
        <mesh {...props} renderOrder={props.isExternalModule ? 2 : 0}>
          <meshBasicMaterial colorWrite={false} />
        </mesh>
      )}

      {props.include && (
        <mesh
          {...props}
          renderOrder={1}
          onClick={ornamental ? () => {} : undefined}
          userData={
            {
              type: 'spacedArmor',
              thickness: props.thickness,
            } satisfies ArmorMeshUserData
          }
        >
          {!ornamental && (
            <shaderMaterial
              fragmentShader={fragmentShader}
              vertexShader={vertexShader}
              uniforms={{
                thickness: { value: props.thickness },
                maxThickness: { value: props.maxThickness },
              }}
            />
          )}

          {ornamental && (
            <meshBasicMaterial colorWrite={false} depthWrite={false} />
          )}
        </mesh>
      )}
    </>
  );
}
