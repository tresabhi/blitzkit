import { useFrame } from '@react-three/fiber';
import { useEffect } from 'react';
import { MeshBasicMaterial, Object3D, ShaderMaterial, Vector2 } from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { canSplash } from '../../../../core/blitz/canSplash';
import { isExplosive } from '../../../../core/blitz/isExplosive';
import { resolveNearPenetration } from '../../../../core/blitz/resolveNearPenetration';
import { hasEquipment } from '../../../../core/blitzkit/hasEquipment';
import { jsxTree } from '../../../../core/blitzkit/jsxTree';
import { ShellDefinition } from '../../../../core/blitzkit/tankDefinitions';
import { EquipmentMatrix, useDuel } from '../../../../stores/duel';
import {
  TankopediaPersistent,
  useTankopediaPersistent,
} from '../../../../stores/tankopedia';
import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';
import { spacedArmorRenderTarget } from './target';

interface CoreArmorSceneComponentProps {
  thickness: number;
  node: Object3D;
}

const excludeMaterial = new MeshBasicMaterial({
  colorWrite: false,
});

export function CoreArmorSceneComponent({
  node,
  thickness,
}: CoreArmorSceneComponentProps) {
  const material = new ShaderMaterial({
    fragmentShader,
    vertexShader,

    transparent: true,

    uniforms: {
      thickness: { value: null },
      penetration: { value: null },
      caliber: { value: null },
      ricochet: { value: null },
      normalization: { value: null },
      isExplosive: { value: null },
      canSplash: { value: null },
      damage: { value: null },
      explosionRadius: { value: null },
      greenPenetration: { value: null },
      opaque: { value: null },
      useSpacedArmor: { value: null },

      inverseProjectionMatrix: { value: null },
      resolution: { value: new Vector2() },
      spacedArmorBuffer: { value: null },
      spacedArmorDepth: { value: null },
    },
  });

  useEffect(() => {
    async function handleShellChange(shell: ShellDefinition) {
      material.uniforms.caliber.value = shell.caliber;
      material.uniforms.ricochet.value = degToRad(shell.ricochet ?? 90);
      material.uniforms.normalization.value = degToRad(
        shell.normalization ?? 0,
      );
      material.uniforms.isExplosive.value = isExplosive(shell.type);
      material.uniforms.canSplash.value = canSplash(shell.type);
      material.uniforms.damage.value = shell.damage.armor;
      material.uniforms.explosionRadius.value = shell.explosionRadius;

      const duel = useDuel.getState();
      await handleProtagonistEquipmentChange(duel.protagonist!.equipmentMatrix);
      await handleAntagonistEquipmentChange(duel.antagonist!.equipmentMatrix);
    }
    function handleVisualChange(
      visual: TankopediaPersistent['model']['visual'],
    ) {
      material.uniforms.greenPenetration.value = visual.greenPenetration;
      material.uniforms.opaque.value = visual.opaque || visual.wireframe;
      material.uniforms.useSpacedArmor.value = visual.showSpacedArmor;
      material.wireframe = visual.wireframe;
    }
    async function handleProtagonistEquipmentChange(
      equipment: EquipmentMatrix,
    ) {
      const duel = useDuel.getState();
      const hasEnhancedArmor = await hasEquipment(
        110,
        duel.protagonist!.tank.equipment,
        equipment,
      );
      material.uniforms.thickness.value = hasEnhancedArmor
        ? thickness * 1.03
        : thickness;
    }
    async function handleAntagonistEquipmentChange(equipment: EquipmentMatrix) {
      const duel = useDuel.getState();
      const penetration = resolveNearPenetration(
        duel.antagonist!.shell.penetration,
      );
      const hasCalibratedShells = await hasEquipment(
        103,
        duel.antagonist!.tank.equipment,
        equipment,
      );

      material.uniforms.penetration.value = hasCalibratedShells
        ? penetration *
          (duel.antagonist!.shell.type === 'ap'
            ? 1.08
            : duel.antagonist!.shell.type === 'ap_cr'
              ? 1.05
              : duel.antagonist!.shell.type === 'hc'
                ? 1.13
                : 1.8)
        : penetration;
    }

    handleShellChange(useDuel.getState().antagonist!.shell);
    handleVisualChange(useTankopediaPersistent.getState().model.visual);
    handleProtagonistEquipmentChange(
      useDuel.getState().protagonist!.equipmentMatrix,
    );
    handleAntagonistEquipmentChange(
      useDuel.getState().antagonist!.equipmentMatrix,
    );

    const unsubscribes = [
      useDuel.subscribe((state) => state.antagonist!.shell, handleShellChange),
      useTankopediaPersistent.subscribe(
        (state) => state.model.visual,
        handleVisualChange,
      ),
      useDuel.subscribe(
        (state) => state.protagonist!.equipmentMatrix,
        handleProtagonistEquipmentChange,
      ),
      useDuel.subscribe(
        (state) => state.antagonist!.equipmentMatrix,
        handleAntagonistEquipmentChange,
      ),
    ];

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  });

  useFrame(({ gl, camera }) => {
    gl.getSize(material.uniforms.resolution.value).multiplyScalar(
      gl.getPixelRatio(),
    );
    material.uniforms.spacedArmorBuffer.value = spacedArmorRenderTarget.texture;
    material.uniforms.spacedArmorDepth.value =
      spacedArmorRenderTarget.depthTexture;
    material.uniforms.inverseProjectionMatrix.value =
      camera.projectionMatrixInverse;
  });

  return (
    <>
      {jsxTree(
        node,
        { renderOrder: 0, material: excludeMaterial },
        `${node.uuid}-exclude`,
      )}
      {jsxTree(node, { renderOrder: 1, material }, `${node.uuid}-include`)}
    </>
  );
}
