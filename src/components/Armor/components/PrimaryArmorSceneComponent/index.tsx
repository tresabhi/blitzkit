import { useFrame } from '@react-three/fiber';
import { useEffect } from 'react';
import { MeshBasicMaterial, Object3D, ShaderMaterial, Vector2 } from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import * as Duel from '../../../../../packages/website/src/stores/duel';
import * as TankopediaPersistent from '../../../../../packages/website/src/stores/tankopediaPersistent';
import { canSplash } from '../../../../core/blitz/canSplash';
import { isExplosive } from '../../../../core/blitz/isExplosive';
import { resolveNearPenetration } from '../../../../core/blitz/resolveNearPenetration';
import { resolvePenetrationCoefficient } from '../../../../core/blitz/resolvePenetrationCoefficient';
import { hasEquipment } from '../../../../core/blitzkit/hasEquipment';
import { jsxTree } from '../../../../core/blitzkit/jsxTree';
import { ShellDefinition } from '../../../../core/blitzkit/tankDefinitions';
import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';
import { spacedArmorRenderTarget } from './target';

interface PrimaryArmorSceneComponentProps {
  thickness: number;
  node: Object3D;
}

const excludeMaterial = new MeshBasicMaterial({
  colorWrite: false,
});

export function PrimaryArmorSceneComponent({
  node,
  thickness,
}: PrimaryArmorSceneComponentProps) {
  const tankopediaPersistentStore = TankopediaPersistent.useStore();
  const duelStore = Duel.useStore();
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

      inverseProjectionMatrix: { value: null },
      resolution: { value: new Vector2() },
      spacedArmorBuffer: { value: null },
      spacedArmorDepth: { value: null },
    },
  });

  useEffect(() => {
    async function handleShellChange(shell: ShellDefinition) {
      material.uniforms.caliber.value = shell.caliber;
      material.uniforms.ricochet.value = degToRad(
        isExplosive(shell.type) ? 90 : shell.ricochet!,
      );
      material.uniforms.normalization.value = degToRad(
        shell.normalization ?? 0,
      );
      material.uniforms.isExplosive.value = isExplosive(shell.type);
      material.uniforms.canSplash.value = canSplash(shell.type);
      material.uniforms.damage.value = shell.damage.armor;
      material.uniforms.explosionRadius.value = shell.explosionRadius;

      const duel = duelStore.getState();
      await handleProtagonistEquipmentChange(duel.protagonist.equipmentMatrix);
      await handleAntagonistEquipmentChange(duel.antagonist.equipmentMatrix);
    }
    function handleVisualChange(
      visual: TankopediaPersistent.TankopediaPersistent['model']['visual'],
    ) {
      material.uniforms.greenPenetration.value = visual.greenPenetration;
      material.uniforms.opaque.value = visual.opaque || visual.wireframe;
      material.wireframe = visual.wireframe;
    }
    async function handleProtagonistEquipmentChange(
      equipment: Duel.EquipmentMatrix,
    ) {
      const duel = duelStore.getState();
      const hasEnhancedArmor = await hasEquipment(
        110,
        duel.protagonist.tank.equipment,
        equipment,
      );
      material.uniforms.thickness.value = hasEnhancedArmor
        ? thickness * 1.03
        : thickness;
    }
    async function handleAntagonistEquipmentChange(
      equipment: Duel.EquipmentMatrix,
    ) {
      const duel = duelStore.getState();
      const shell = duel.antagonist.shell;
      const penetration = resolveNearPenetration(shell.penetration);
      const hasCalibratedShells = await hasEquipment(
        103,
        duel.antagonist.tank.equipment,
        equipment,
      );

      material.uniforms.penetration.value =
        penetration *
        resolvePenetrationCoefficient(hasCalibratedShells, shell.type);
    }

    handleShellChange(duelStore.getState().antagonist.shell);
    handleVisualChange(tankopediaPersistentStore.getState().model.visual);
    handleProtagonistEquipmentChange(
      duelStore.getState().protagonist.equipmentMatrix,
    );
    handleAntagonistEquipmentChange(
      duelStore.getState().antagonist.equipmentMatrix,
    );

    const unsubscribes = [
      duelStore.subscribe((state) => state.antagonist.shell, handleShellChange),
      tankopediaPersistentStore.subscribe(
        (state) => state.model.visual,
        handleVisualChange,
      ),
      duelStore.subscribe(
        (state) => state.protagonist.equipmentMatrix,
        handleProtagonistEquipmentChange,
      ),
      duelStore.subscribe(
        (state) => state.antagonist.equipmentMatrix,
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
        { mesh: { renderOrder: 0, material: excludeMaterial } },
        `${node.uuid}-exclude`,
      )}
      {jsxTree(
        node,
        { mesh: { renderOrder: 1, material } },
        `${node.uuid}-include`,
      )}
    </>
  );
}
