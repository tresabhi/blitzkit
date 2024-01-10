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
}

export function ArmorMesh({
  thickness,
  penetration,
  caliber,
  ricochet,
  normalization,
  ...props
}: ArmorMeshProps) {
  const opaqueArmor = useTankopedia((state) => state.model.opaqueArmor);

  return (
    <>
      <mesh {...props}>
        <meshBasicMaterial colorWrite={false} />
      </mesh>

      <mesh {...props} renderOrder={1}>
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
          }}
          vertexShader={vertex}
          // split shaders due to https://github.com/FarazzShaikh/THREE-CustomShaderMaterial/issues/48
          fragmentShader={opaqueArmor ? fragmentOpaque : fragment}
        />
      </mesh>
    </>
  );
}
