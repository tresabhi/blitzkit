import { MeshProps } from '@react-three/fiber';

interface ArmorMeshProps extends MeshProps {}

export function ArmorMesh(props: ArmorMeshProps) {
  return (
    <>
      <mesh {...props}>
        <meshBasicMaterial colorWrite={false} />
      </mesh>

      <mesh {...props} renderOrder={1}>
        <meshBasicMaterial
          transparent
          opacity={Math.random() / 2}
          color="red"
          depthWrite={false}
        />
      </mesh>
    </>
  );
}
