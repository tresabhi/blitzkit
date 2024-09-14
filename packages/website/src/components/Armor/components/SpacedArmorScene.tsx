import { memo, useRef } from 'react';
import { Group, Plane, Scene, Vector3 } from 'three';
import { correctZYTuple } from '../../../../../website-legacy/src/core/blitz/correctZYTuple';
import { nameToArmorId } from '../../../../../website-legacy/src/core/blitzkit/nameToArmorId';
import { resolveArmor } from '../../../../../website-legacy/src/core/blitzkit/resolveThickness';
import { useArmor } from '../../../../../website-legacy/src/hooks/useArmor';
import { useModel } from '../../../../../website-legacy/src/hooks/useModel';
import { useTankModelDefinition } from '../../../../../website-legacy/src/hooks/useTankModelDefinition';
import { useTankTransform } from '../../../../../website-legacy/src/hooks/useTankTransform';
import * as Duel from '../../../../../website-legacy/src/stores/duel';
import { ModelTankWrapper } from './ModelTankWrapper';
import { SpacedArmorSceneComponent } from './SpacedArmorSceneComponent';

export enum ArmorType {
  Primary,
  Spaced,
  External,
}

interface SpacedArmorSceneProps {
  scene: Scene;
}

export const SpacedArmorScene = memo<SpacedArmorSceneProps>(({ scene }) => {
  const wrapper = useRef<Group>(null);
  const turretContainer = useRef<Group>(null);
  const gunContainer = useRef<Group>(null);
  const protagonist = Duel.use((draft) => draft.protagonist);
  const tank = Duel.use((state) => state.protagonist.tank);
  const track = Duel.use((state) => state.protagonist.track);
  const turret = Duel.use((state) => state.protagonist.turret);
  const gun = Duel.use((state) => state.protagonist.gun);
  const { gltf: armorGltf } = useArmor(tank.id);
  const { gltf: modelGltf } = useModel(tank.id);
  const armorNodes = Object.values(armorGltf.nodes);
  const modelNodes = Object.values(modelGltf.nodes);
  const tankModelDefinition = useTankModelDefinition();
  const trackModelDefinition = tankModelDefinition.tracks[track.id];
  const turretModelDefinition = tankModelDefinition.turrets[turret.id];
  const gunModelDefinition = turretModelDefinition.guns[gun.id];
  const hullOrigin = correctZYTuple(trackModelDefinition.origin);
  const turretOrigin = correctZYTuple(tankModelDefinition.turretOrigin);
  const gunOrigin = correctZYTuple(turretModelDefinition.gunOrigin);
  const maskOrigin =
    gunModelDefinition.mask === undefined
      ? undefined
      : gunModelDefinition.mask + hullOrigin.y + turretOrigin.y + gunOrigin.y;
  const isDynamicArmorActive = Duel.use((state) =>
    state.protagonist.consumables.includes(73),
  );

  useTankTransform(protagonist, turretContainer, gunContainer);

  return (
    <ModelTankWrapper ref={wrapper}>
      <group position={hullOrigin}>
        {armorNodes.map((node) => {
          const isHull = node.name.startsWith('hull_');
          const isVisible = isHull;
          const armorId = nameToArmorId(node.name);
          const { spaced, thickness } = resolveArmor(
            tankModelDefinition.armor,
            armorId,
          );

          if (
            !isVisible ||
            thickness === undefined ||
            (isDynamicArmorActive && node.name.includes('state_00')) ||
            (!isDynamicArmorActive && node.name.includes('state_01'))
          )
            return null;

          return (
            <SpacedArmorSceneComponent
              scene={scene}
              key={node.uuid}
              type={spaced ? ArmorType.Spaced : ArmorType.Primary}
              thickness={thickness}
              node={node}
            />
          );
        })}
      </group>

      {modelNodes.map((node) => {
        const isWheel = node.name.startsWith('chassis_wheel_');
        const isTrack = node.name.startsWith('chassis_track_');
        const isVisible = isWheel || isTrack;

        if (!isVisible) return null;

        return (
          <SpacedArmorSceneComponent
            scene={scene}
            key={node.uuid}
            type={ArmorType.External}
            thickness={trackModelDefinition.thickness}
            variant="track"
            node={node}
          />
        );
      })}

      <group ref={turretContainer}>
        {armorNodes.map((node) => {
          const isCurrentTurret = node.name.startsWith(
            `turret_${turretModelDefinition.model.toString().padStart(2, '0')}`,
          );
          const isVisible = isCurrentTurret;
          const armorId = nameToArmorId(node.name);
          const { spaced, thickness } = resolveArmor(
            turretModelDefinition.armor,
            armorId,
          );

          if (
            !isVisible ||
            thickness === undefined ||
            (isDynamicArmorActive && node.name.includes('state_00')) ||
            (!isDynamicArmorActive && node.name.includes('state_01'))
          )
            return null;

          return (
            <group position={hullOrigin}>
              <group key={node.uuid} position={turretOrigin}>
                <SpacedArmorSceneComponent
                  scene={scene}
                  key={node.uuid}
                  type={spaced ? ArmorType.Spaced : ArmorType.Primary}
                  thickness={thickness}
                  node={node}
                />
              </group>
            </group>
          );
        })}

        <group ref={gunContainer}>
          {armorNodes.map((node) => {
            const isCurrentGun = node.name.startsWith(
              `gun_${gunModelDefinition.model.toString().padStart(2, '0')}`,
            );
            const isVisible = isCurrentGun;
            const armorId = nameToArmorId(node.name);
            const { spaced, thickness } = resolveArmor(
              gunModelDefinition.armor,
              armorId,
            );

            if (
              !isVisible ||
              thickness === undefined ||
              (isDynamicArmorActive && node.name.includes('state_00')) ||
              (!isDynamicArmorActive && node.name.includes('state_01'))
            )
              return null;

            return (
              <group position={hullOrigin}>
                <group
                  key={node.uuid}
                  position={turretOrigin.clone().add(gunOrigin)}
                >
                  <SpacedArmorSceneComponent
                    scene={scene}
                    type={spaced ? ArmorType.Spaced : ArmorType.Primary}
                    thickness={thickness}
                    node={node}
                  />
                </group>
              </group>
            );
          })}

          {modelNodes.map((node) => {
            const gunString = `gun_${gunModelDefinition.model
              .toString()
              .padStart(2, '0')}`;
            const isCurrentGun = gunModelDefinition.mask
              ? node.name.startsWith(gunString)
              : node.name === gunString;
            const isVisible = isCurrentGun;

            if (!isVisible) return null;

            return (
              <SpacedArmorSceneComponent
                scene={scene}
                key={node.uuid}
                type={ArmorType.External}
                thickness={gunModelDefinition.thickness}
                variant="gun"
                node={node}
                clip={
                  maskOrigin === undefined
                    ? undefined
                    : new Plane(new Vector3(0, 0, -1), -maskOrigin)
                }
              />
            );
          })}
        </group>
      </group>
    </ModelTankWrapper>
  );
});
