import { MeshProps } from '@react-three/fiber';
import { Color, WebGLRenderTarget } from 'three';

export const externalModuleMaskRenderTarget = new WebGLRenderTarget();

type ArmorMeshExternalModuleMaskProps = MeshProps &
  (
    | {
        exclude?: false;
        maxThickness: number;
        thickness: number;
      }
    | {
        exclude: true;
      }
  );

export function ArmorMeshExternalModuleMask(
  props: ArmorMeshExternalModuleMaskProps,
) {
  return (
    <>
      {props.exclude && (
        <mesh {...props} renderOrder={0}>
          <meshBasicMaterial colorWrite={false} />
        </mesh>
      )}

      {!props.exclude && (
        <mesh {...props} renderOrder={1}>
          <meshBasicMaterial
            color={new Color(1, props.thickness / props.maxThickness, 0)}
            depthWrite={false}
          />
        </mesh>
      )}
    </>
  );
}
