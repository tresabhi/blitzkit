import { MeshProps } from '@react-three/fiber';
import { MeshStandardMaterial } from 'three';
import CustomShaderMaterial from 'three-custom-shader-material';
import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';

interface ArmorMeshProps extends MeshProps {
  thickness: number;
  penetration: number;
  caliber: number;
  spaced?: boolean;
  canRicochet: boolean;
  canSplash: boolean;
  ricochet?: number;
  normalization?: number;
  isAffectedBySpaced: boolean;
}

// shader split: https://github.com/FarazzShaikh/THREE-CustomShaderMaterial/issues/48

export function ArmorMesh({
  thickness,
  penetration,
  caliber,
  canRicochet,
  ricochet,
  canSplash,
  isAffectedBySpaced,
  normalization,
  spaced = false,
  ...props
}: ArmorMeshProps) {
  return (
    <>
      {!spaced && (
        <mesh {...props}>
          <meshBasicMaterial colorWrite={false} />
        </mesh>
      )}

      <mesh {...props} renderOrder={spaced ? 3 : 1}>
        <CustomShaderMaterial
          baseMaterial={MeshStandardMaterial}
          transparent
          silent
          depthWrite={false}
          uniforms={{
            thickness: { value: thickness },
            penetration: { value: penetration },
            ricochet: {
              value: ricochet === undefined ? 0 : ricochet * (Math.PI / 180),
            },
            normalization: {
              value:
                normalization === undefined
                  ? 0
                  : normalization * (Math.PI / 180),
            },
            caliber: { value: caliber },
            spaced: { value: spaced ?? false },
            canRicochet: { value: canRicochet },
            canSplash: { value: canSplash },
            isAffectedBySpaced: { value: isAffectedBySpaced },
          }}
          vertexShader={vertex}
          fragmentShader={fragment}
        />
      </mesh>
    </>
  );
}
