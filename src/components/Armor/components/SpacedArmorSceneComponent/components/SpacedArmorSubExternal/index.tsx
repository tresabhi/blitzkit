import { useEffect } from 'react';
import {
  AdditiveBlending,
  MeshBasicMaterial,
  Object3D,
  Plane,
  ShaderMaterial,
} from 'three';
import { ArmorUserData, ExternalModuleVariant } from '../..';
import { isExplosive } from '../../../../../../core/blitz/isExplosive';
import { resolveNearPenetration } from '../../../../../../core/blitz/resolveNearPenetration';
import { hasEquipment } from '../../../../../../core/blitzrinth/hasEquipment';
import { jsxTree } from '../../../../../../core/blitzrinth/jsxTree';
import { ShellDefinition } from '../../../../../../core/blitzrinth/tankDefinitions';
import { EquipmentMatrix, useDuel } from '../../../../../../stores/duel';
import { ArmorType } from '../../../SpacedArmorScene';
import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';

interface SpacedArmorSubExternalProps {
  node: Object3D;
  thickness: number;
  variant: ExternalModuleVariant;
  clip?: Plane;
}

export function SpacedArmorSubExternal({
  node,
  thickness,
  variant,
  clip,
}: SpacedArmorSubExternalProps) {
  const material = new ShaderMaterial({
    fragmentShader,
    vertexShader,

    depthTest: true,
    depthWrite: false,
    blending: AdditiveBlending,
    clippingPlanes: clip ? [clip] : undefined,
    clipping: true,

    uniforms: {
      thickness: { value: null },
      penetration: { value: null },
    },
  });

  useEffect(() => {
    function handleShellChange(shell: ShellDefinition) {
      material.uniforms.penetration.value = resolveNearPenetration(
        shell.penetration,
      );
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
        ? thickness * 1.04
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
        ? penetration * (isExplosive(duel.antagonist!.shell.type) ? 1.1 : 1.05)
        : penetration;
    }

    handleShellChange(useDuel.getState().antagonist!.shell);
    handleProtagonistEquipmentChange(
      useDuel.getState().protagonist!.equipmentMatrix,
    );
    handleAntagonistEquipmentChange(
      useDuel.getState().antagonist!.equipmentMatrix,
    );

    const unsubscribes = [
      useDuel.subscribe((state) => state.antagonist!.shell, handleShellChange),
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

  return (
    <>
      {jsxTree(node, {
        renderOrder: 3,
        material: new MeshBasicMaterial({
          colorWrite: false,
          depthTest: true,
          depthWrite: true,
          clippingPlanes: clip ? [clip] : undefined,
        }),
        onClick() {},
        userData: {
          type: ArmorType.External,
          thickness,
          variant,
        } satisfies ArmorUserData,
      })}

      {jsxTree(node, {
        renderOrder: 4,
        material,
      })}
    </>
  );
}
