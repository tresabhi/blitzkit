import { ArmorPlate } from '@blitzkit/core';
import type { MeshProps } from '@react-three/fiber';
import { Fragment } from 'react';
import { AdditiveBlending, MeshBasicMaterial, ShaderMaterial } from 'three';
import { Duel } from '../../../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../../../stores/tankopediaEphemeral';
import fragmentShader from './shaders/fragment.glsl?raw';
import vertexShader from './shaders/vertex.glsl?raw';

interface SpacedArmorSubSpacedProps extends MeshProps {
  armorPlate: ArmorPlate;
}

const depthWriteMaterial = new MeshBasicMaterial({
  depthWrite: true,
  colorWrite: false,
});

export function SpacedArmorSubSpaced({
  armorPlate,
  ...props
}: SpacedArmorSubSpacedProps) {
  const tankopediaEphemeralStore = TankopediaEphemeral.useStore();
  const duelStore = Duel.useStore();
  const material = new ShaderMaterial({
    fragmentShader,
    vertexShader,

    depthTest: true,
    depthWrite: false,
    blending: AdditiveBlending,

    uniforms: {
      thickness: { value: null },
      penetration: { value: null },
      caliber: { value: null },
      ricochet: { value: null },
      normalization: { value: null },
    },
  });

  // useEffect(() => {
  //   function handleShellChange() {
  //     const duel = duelStore.getState();
  //     const tankopediaEphemeral = tankopediaEphemeralStore.getState();
  //     const shell = tankopediaEphemeral.customShell ?? duel.antagonist.shell;

  //     material.uniforms.penetration.value = shell.penetration.near;
  //     material.uniforms.caliber.value = shell.caliber;
  //     material.uniforms.ricochet.value = degToRad(
  //       isExplosive(shell.type) ? 90 : shell.ricochet!,
  //     );
  //     material.uniforms.normalization.value = degToRad(
  //       shell.normalization ?? 0,
  //     );
  //   }
  //   async function handleProtagonistEquipmentChange(
  //     equipment: EquipmentMatrix,
  //   ) {
  //     const duel = duelStore.getState();
  //     const hasEnhancedArmor = await hasEquipment(
  //       110,
  //       duel.protagonist.tank.equipment_preset,
  //       equipment,
  //     );
  //     material.uniforms.thickness.value = hasEnhancedArmor
  //       ? thickness * 1.03
  //       : thickness;
  //   }
  //   async function handleAntagonistEquipmentChange(equipment: EquipmentMatrix) {
  //     const duel = duelStore.getState();
  //     const tankopediaEphemeral = tankopediaEphemeralStore.getState();
  //     const shell = tankopediaEphemeral.customShell ?? duel.antagonist.shell;
  //     const penetration = shell.penetration.near;
  //     const hasCalibratedShells = await hasEquipment(
  //       103,
  //       duel.antagonist.tank.equipment_preset,
  //       equipment,
  //     );

  //     material.uniforms.penetration.value =
  //       penetration *
  //       resolvePenetrationCoefficient(hasCalibratedShells, shell.type);
  //   }

  //   handleShellChange();
  //   handleProtagonistEquipmentChange(
  //     duelStore.getState().protagonist.equipmentMatrix,
  //   );
  //   handleAntagonistEquipmentChange(
  //     duelStore.getState().antagonist.equipmentMatrix,
  //   );

  //   const unsubscribes = [
  //     duelStore.subscribe((state) => state.antagonist.shell, handleShellChange),
  //     tankopediaEphemeralStore.subscribe(
  //       (state) => state.customShell,
  //       handleShellChange,
  //     ),
  //     duelStore.subscribe(
  //       (state) => state.protagonist.equipmentMatrix,
  //       handleProtagonistEquipmentChange,
  //     ),
  //     duelStore.subscribe(
  //       (state) => state.antagonist.equipmentMatrix,
  //       handleAntagonistEquipmentChange,
  //     ),
  //   ];

  //   return () => {
  //     unsubscribes.forEach((unsubscribe) => unsubscribe());
  //   };
  // });

  return (
    <Fragment>
      <mesh
        {...props}
        renderOrder={2}
        material={material}
        onClick={() => {}}
        userData={armorPlate}
      />
      <mesh {...props} renderOrder={5} material={depthWriteMaterial} />
    </Fragment>
  );
}
