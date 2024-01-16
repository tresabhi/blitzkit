import { MeshProps } from '@react-three/fiber';
import { WebGLRenderTarget } from 'three';

export const externalModuleMaskRenderTarget = new WebGLRenderTarget();

interface ArmorMeshExternalModuleMaskProps extends MeshProps {
  exclude?: boolean;
}

export function ArmorMeshExternalModuleMask({
  exclude = false,
  ...props
}: ArmorMeshExternalModuleMaskProps) {
  return (
    <>
      {exclude && (
        <mesh {...props} renderOrder={0}>
          <meshBasicMaterial colorWrite={false} />
        </mesh>
      )}

      {!exclude && (
        <mesh {...props} renderOrder={1}>
          <meshBasicMaterial color="#ff0000" depthWrite={false} />
        </mesh>
      )}
    </>
  );
}
