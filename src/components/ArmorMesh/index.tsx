import { MeshProps } from '@react-three/fiber';
import { MeshStandardMaterial } from 'three';
import CustomShaderMaterial from 'three-custom-shader-material';
import { degToRad } from 'three/src/math/MathUtils';
import { Duel } from '../../app/tools/tankopedia/[id]/page';
import { canSplash } from '../../core/blitz/canSplash';
import { isExplosive } from '../../core/blitz/isExplosive';
import { resolveNearPenetration } from '../../core/blitz/resolveNearPenetration';
import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';

interface ArmorMeshProps extends MeshProps {
  duel: Duel;
  isSpaced: boolean;
  isExternalModule?: boolean;
  thickness: number;
}

export function ArmorMesh({
  isSpaced,
  isExternalModule = false,
  thickness,
  duel,
  ...props
}: ArmorMeshProps) {
  const { shell } = duel.antagonist;

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
