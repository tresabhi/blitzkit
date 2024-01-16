import { MeshProps } from '@react-three/fiber';
import { WebGLRenderTarget } from 'three';

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
            color={`rgb(255, ${
              (props.thickness / props.maxThickness) * 255
            }, 0)`}
            depthWrite={false}
          />
        </mesh>
      )}
    </>
  );
}
