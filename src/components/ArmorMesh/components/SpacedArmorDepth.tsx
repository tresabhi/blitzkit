import { MeshProps } from '@react-three/fiber';
import { WebGLRenderTarget } from 'three';

export const spacedArmorDepthRenderTarget = new WebGLRenderTarget();

interface ArmorMeshSpacedArmorDepthProps extends MeshProps {
  exclude?: boolean;
}

export function ArmorMeshSpacedArmorDepth({
  exclude = false,
  ...props
}: ArmorMeshSpacedArmorDepthProps) {
  return (
    <mesh {...props}>
      <meshBasicMaterial colorWrite={false} />
    </mesh>
  );
}
