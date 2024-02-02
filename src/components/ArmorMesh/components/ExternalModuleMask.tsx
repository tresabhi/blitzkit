import { MeshProps } from '@react-three/fiber';
import { Color, WebGLRenderTarget } from 'three';
import { ArmorMeshUserData } from './Armor';

export const externalModuleMaskRenderTarget = new WebGLRenderTarget();

type ArmorMeshExternalModuleMaskProps = MeshProps & {
  ornamental?: boolean;
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

export function ArmorMeshExternalModuleMask({
  ornamental = false,
  ...props
}: ArmorMeshExternalModuleMaskProps) {
  return (
    <>
      {(props.exclude || ornamental) && (
        <mesh {...props} renderOrder={0}>
          <meshBasicMaterial colorWrite={false} />
        </mesh>
      )}

      {!props.exclude && (
        <mesh
          {...props}
          renderOrder={1}
          onClick={ornamental ? () => {} : undefined}
          userData={
            {
              type: 'externalModule',
              thickness: props.thickness,
            } satisfies ArmorMeshUserData
          }
        >
          <meshBasicMaterial
            color={new Color(1, props.thickness / props.maxThickness, 0)}
            depthWrite={false}
            colorWrite={!ornamental}
          />
        </mesh>
      )}
    </>
  );
}
