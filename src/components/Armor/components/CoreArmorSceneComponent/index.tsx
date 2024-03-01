import { useFrame } from '@react-three/fiber';
import { useEffect } from 'react';
import {
  GLSL3,
  MeshBasicMaterial,
  Object3D,
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget,
} from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { canSplash } from '../../../../core/blitz/canSplash';
import { isExplosive } from '../../../../core/blitz/isExplosive';
import { resolveNearPenetration } from '../../../../core/blitz/resolveNearPenetration';
import { hasEquipment } from '../../../../core/blitzkrieg/hasEquipment';
import { jsxTree } from '../../../../core/blitzkrieg/jsxTree';
import { ShellDefinition } from '../../../../core/blitzkrieg/tankDefinitions';
import { EquipmentMatrix, useDuel } from '../../../../stores/duel';
import {
  TankopediaPersistent,
  useTankopediaPersistent,
} from '../../../../stores/tankopedia';
import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';

export const spacedArmorRenderTarget = new WebGLRenderTarget();

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
    glslVersion: GLSL3,
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

      resolution: { value: new Vector2() },
      spacedArmorBuffer: { value: null },
      spacedArmorDepth: { value: null },
    },
  });

  useEffect(() => {
    function handleShellChange(shell: ShellDefinition) {
      material.uniforms.penetration.value = resolveNearPenetration(
        shell.penetration,
      );
      material.uniforms.caliber.value = shell.caliber;
      material.uniforms.ricochet.value = degToRad(shell.ricochet ?? 90);
      material.uniforms.normalization.value = degToRad(
        shell.normalization ?? 0,
      );
      material.uniforms.isExplosive.value = isExplosive(shell.type);
      material.uniforms.canSplash.value = canSplash(shell.type);
      material.uniforms.damage.value = shell.damage.armor;
      material.uniforms.explosionRadius.value = shell.explosionRadius;
    }
    function handleVisualChange(
      visual: TankopediaPersistent['model']['visual'],
    ) {
      material.uniforms.greenPenetration.value = visual.greenPenetration;
      material.uniforms.opaque.value = visual.opaque || visual.wireframe;
      material.wireframe = visual.wireframe;
    }
    async function handleProtagonistEquipmentChange(
      equipment: EquipmentMatrix,
    ) {
      const hasEnhancedArmor = await hasEquipment(110, false, equipment);
      material.uniforms.thickness.value = hasEnhancedArmor
        ? thickness * 1.04
        : thickness;
    }
    async function handleAntagonistEquipmentChange(equipment: EquipmentMatrix) {
      const shell = useDuel.getState().antagonist!.shell;
      const penetration = resolveNearPenetration(shell.penetration);
      const hasCalibratedShells = await hasEquipment(103, true, equipment);
      material.uniforms.penetration.value = hasCalibratedShells
        ? penetration * (isExplosive(shell.type) ? 1.1 : 1.05)
        : penetration;
    }

    handleShellChange(useDuel.getState().antagonist!.shell);
    handleVisualChange(useTankopediaPersistent.getState().model.visual);
    handleProtagonistEquipmentChange(useDuel.getState().protagonist!.equipment);
    handleAntagonistEquipmentChange(useDuel.getState().antagonist!.equipment);

    const unsubscribes = [
      useDuel.subscribe((state) => state.antagonist!.shell, handleShellChange),
      useTankopediaPersistent.subscribe(
        (state) => state.model.visual,
        handleVisualChange,
      ),
      useDuel.subscribe(
        (state) => state.protagonist!.equipment,
        handleProtagonistEquipmentChange,
      ),
      useDuel.subscribe(
        (state) => state.antagonist!.equipment,
        handleAntagonistEquipmentChange,
      ),
    ];

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  useFrame(({ gl }) => {
    gl.getSize(material.uniforms.resolution.value).multiplyScalar(
      gl.getPixelRatio(),
    );
    material.uniforms.spacedArmorBuffer.value = spacedArmorRenderTarget.texture;
    material.uniforms.spacedArmorDepth.value =
      spacedArmorRenderTarget.depthTexture;
  });

  return (
    <>
      {jsxTree(node, {
        renderOrder: 0,
        material: excludeMaterial,
      })}
      {jsxTree(node, {
        renderOrder: 1,
        material,
      })}
    </>
  );
}
