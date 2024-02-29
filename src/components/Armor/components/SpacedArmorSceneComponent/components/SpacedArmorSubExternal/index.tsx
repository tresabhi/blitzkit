import { useEffect } from 'react';
import {
  AdditiveBlending,
  MeshBasicMaterial,
  Object3D,
  ShaderMaterial,
} from 'three';
import { ArmorUserData, ExternalModuleVariant } from '../..';
import { isExplosive } from '../../../../../../core/blitz/isExplosive';
import { resolveNearPenetration } from '../../../../../../core/blitz/resolveNearPenetration';
import { hasEquipment } from '../../../../../../core/blitzkrieg/hasEquipment';
import { jsxTree } from '../../../../../../core/blitzkrieg/jsxTree';
import { ShellDefinition } from '../../../../../../core/blitzkrieg/tankDefinitions';
import { EquipmentMatrix, useDuel } from '../../../../../../stores/duel';
import { ArmorType } from '../../../SpacedArmorScene';
import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';

interface SpacedArmorSubExternalProps {
  node: Object3D;
  thickness: number;
  variant: ExternalModuleVariant;
}

export function SpacedArmorSubExternal({
  node,
  thickness,
  variant,
}: SpacedArmorSubExternalProps) {
  const material = new ShaderMaterial({
    fragmentShader,
    vertexShader,

    depthTest: true,
    depthWrite: false,
    blending: AdditiveBlending,

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
    handleProtagonistEquipmentChange(useDuel.getState().protagonist!.equipment);
    handleAntagonistEquipmentChange(useDuel.getState().antagonist!.equipment);

    const unsubscribes = [
      useDuel.subscribe((state) => state.antagonist!.shell, handleShellChange),
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

  return (
    <>
      {jsxTree(node, {
        renderOrder: 3,
        material: new MeshBasicMaterial({
          colorWrite: false,
          depthTest: true,
          depthWrite: true,
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
