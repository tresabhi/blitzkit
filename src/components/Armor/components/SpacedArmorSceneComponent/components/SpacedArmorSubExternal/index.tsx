import { useEffect } from 'react';
import {
  AdditiveBlending,
  MeshBasicMaterial,
  Object3D,
  Plane,
  ShaderMaterial,
} from 'three';
import { ArmorUserData, ExternalModuleVariant } from '../..';
import { resolveNearPenetration } from '../../../../../../core/blitz/resolveNearPenetration';
import { hasEquipment } from '../../../../../../core/blitzkit/hasEquipment';
import { jsxTree } from '../../../../../../core/blitzkit/jsxTree';
import { ShellDefinition } from '../../../../../../core/blitzkit/tankDefinitions';
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
    clipping: clip !== undefined,
    ...(clip ? { clippingPlanes: [clip] } : {}),

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
            ? 0.08
            : duel.antagonist!.shell.type === 'ap_cr'
              ? 0.05
              : duel.antagonist!.shell.type === 'hc'
                ? 0.13
                : 0.8)
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
      {jsxTree(
        node,
        {
          renderOrder: 3,
          material: new MeshBasicMaterial({
            colorWrite: false,
            depthTest: true,
            depthWrite: true,
            ...(clip ? { clippingPlanes: [clip] } : {}),
          }),
          onClick() {},
          userData: {
            type: ArmorType.External,
            thickness,
            variant,
          } satisfies ArmorUserData,
        },
        `${node.uuid}-exclude`,
      )}

      {jsxTree(node, { renderOrder: 4, material }, `${node.uuid}-include`)}
    </>
  );
}
