import { MeshProps } from '@react-three/fiber';
import { MeshStandardMaterial } from 'three';
import CustomShaderMaterial from 'three-custom-shader-material';
import { degToRad } from 'three/src/math/MathUtils';
import { canSplash } from '../../core/blitz/canSplash';
import { isExplosive } from '../../core/blitz/isExplosive';
import { resolveNearPenetration } from '../../core/blitz/resolveNearPenetration';
import { useTankopedia } from '../../stores/tankopedia';
import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';

interface ArmorMeshProps extends MeshProps {
  isSpaced: boolean;
  isExternalModule?: boolean;
  thickness: number;
}

export function ArmorMesh({
  isSpaced,
  isExternalModule = false,
  thickness,
  ...props
}: ArmorMeshProps) {
  const shell = useTankopedia((state) => {
    if (!state.areTanksAssigned) return;
    return state.antagonist.shell;
  });

  if (!shell) return null;

  return (
    <>
      {!isSpaced && (
        <mesh {...props}>
          <meshBasicMaterial colorWrite={false} />
        </mesh>
      )}

      <mesh {...props}>
        <CustomShaderMaterial
          silent
          baseMaterial={MeshStandardMaterial}
          transparent
          depthWrite={false}
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={{
            isExplosive: { value: isExplosive(shell.type) },
            canSplash: { value: canSplash(shell.type) },
            isSpaced: { value: isSpaced },
            isExternalModule: { value: isExternalModule },
            thickness: { value: thickness },
            penetration: {
              value: resolveNearPenetration(shell.penetration),
            },
            caliber: { value: shell.caliber },
            ricochet: { value: degToRad(shell.ricochet ?? 90) },
            normalization: {
              value: degToRad(shell.normalization ?? 0),
            },
          }}
        />
      </mesh>
    </>
  );
}
