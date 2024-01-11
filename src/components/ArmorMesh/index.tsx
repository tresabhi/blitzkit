import { MeshProps } from '@react-three/fiber';
import { MeshStandardMaterial } from 'three';
import CustomShaderMaterial from 'three-custom-shader-material';
import { useTankopedia } from '../../stores/tankopedia';
import fragment from './shaders/fragment.glsl';
import fragmentOpaque from './shaders/fragmentOpaque.glsl';
import vertex from './shaders/vertex.glsl';

interface ArmorMeshProps extends MeshProps {
  thickness: number;
  penetration: number;
  caliber: number;
  spaced?: boolean;
  canRicochet: boolean;
  ricochet?: number;
  normalization?: number;
}

// shader split: https://github.com/FarazzShaikh/THREE-CustomShaderMaterial/issues/48

export function ArmorMesh({
  thickness,
  penetration,
  caliber,
  canRicochet,
  ricochet,
  normalization,
  spaced = false,
  ...props
}: ArmorMeshProps) {
  const opaqueArmor = useTankopedia((state) => state.model.opaqueArmor);

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
          }}
          vertexShader={vertex}
          fragmentShader={opaqueArmor && !spaced ? fragmentOpaque : fragment}
        />
      </mesh>
    </>
  );
}
