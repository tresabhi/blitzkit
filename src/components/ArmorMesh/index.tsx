import { MeshProps } from '@react-three/fiber';
import { MeshBasicMaterial } from 'three';
import CustomShaderMaterial from 'three-custom-shader-material';
import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';

interface ArmorMeshProps extends MeshProps {
  thickness: number;
  penetration: number;
  ricochet: number;
  caliber: number;
  normalization: number;
}

export function ArmorMesh({
  thickness,
  penetration,
  caliber,
  ricochet,
  normalization,
  ...props
}: ArmorMeshProps) {
  return (
    <>
      <mesh {...props}>
        <meshBasicMaterial colorWrite={false} />
      </mesh>

      <mesh {...props} renderOrder={1}>
        <CustomShaderMaterial
          baseMaterial={MeshBasicMaterial}
          transparent
          silent
          depthWrite={false}
          uniforms={{
            thickness: { value: thickness },
            penetration: { value: penetration },
            ricochet: { value: ricochet * (Math.PI / 180) },
            caliber: { value: caliber },
            normalization: { value: normalization * (Math.PI / 180) },
          }}
          vertexShader={vertex}
          fragmentShader={fragment}
        />
      </mesh>
    </>
  );
}
