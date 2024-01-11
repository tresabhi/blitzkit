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
  ricochet: number;
  caliber: number;
  normalization: number;
  spaced?: boolean;
}

// shader split: https://github.com/FarazzShaikh/THREE-CustomShaderMaterial/issues/48

export function ArmorMesh({
  thickness,
  penetration,
  caliber,
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
          // depthWrite={false}
          uniforms={{
            thickness: { value: thickness },
            penetration: { value: penetration },
            ricochet: { value: ricochet * (Math.PI / 180) },
            caliber: { value: caliber },
            normalization: { value: normalization * (Math.PI / 180) },
            spaced: { value: spaced },
          }}
          vertexShader={vertex}
          fragmentShader={opaqueArmor && !spaced ? fragmentOpaque : fragment}
        />
      </mesh>
    </>
  );
}
