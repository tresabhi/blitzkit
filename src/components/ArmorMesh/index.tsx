import { MeshProps } from '@react-three/fiber';
import { MeshStandardMaterial } from 'three';
import CustomShaderMaterial from 'three-custom-shader-material';
import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';

interface ArmorMeshProps extends MeshProps {
  isExplosive: boolean;
  canSplash: boolean;
  isSpaced: boolean;
  isArmor: boolean;
  thickness: number;
  penetration: number;
  caliber: number;
  ricochet: number;
  normalization: number;
}

export function ArmorMesh({
  isExplosive,
  canSplash,
  isSpaced,
  isArmor,
  thickness,
  penetration,
  caliber,
  ricochet,
  normalization,
  ...props
}: ArmorMeshProps) {
  return (
    <>
      {!isSpaced && (
        <mesh {...props}>
          <meshBasicMaterial colorWrite={false} />
        </mesh>
      )}

      <mesh {...props} renderOrder={1}>
        <CustomShaderMaterial
          silent
          baseMaterial={MeshStandardMaterial}
          transparent
          depthWrite={false}
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={{
            isExplosive: { value: isExplosive },
            canSplash: { value: canSplash },
            isSpaced: { value: isSpaced },
            isArmor: { value: isArmor },
            thickness: { value: thickness },
            penetration: { value: penetration },
            caliber: { value: caliber },
            ricochet: { value: ricochet * (Math.PI / 180) },
            normalization: { value: normalization * (Math.PI / 180) },
          }}
        />
      </mesh>
    </>
  );
}
