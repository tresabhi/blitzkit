import { memo, useEffect, useRef } from 'react';
import { Group } from 'three';
import { correctZYTuple } from '../../../core/blitz/correctZYTuple';
import { nameToArmorId } from '../../../core/blitzkit/nameToArmorId';
import { resolveArmor } from '../../../core/blitzkit/resolveThickness';
import { useArmor } from '../../../hooks/useArmor';
import { useModelDefinitions } from '../../../hooks/useModelDefinitions';
import { useTankTransform } from '../../../hooks/useTankTransform';
import * as Duel from '../../../stores/duel';
import * as TankopediaPersistent from '../../../stores/tankopediaPersistent';
import { CoreArmorSceneComponent } from './CoreArmorSceneComponent';
import { ModelTankWrapper } from './ModelTankWrapper';

export const CoreArmorScene = memo(() => {
  const wrapper = useRef<Group>(null);
  const modelDefinitions = useModelDefinitions();
  const turretContainer = useRef<Group>(null);
  const gunContainer = useRef<Group>(null);
  const tankopediaPersistentStore = TankopediaPersistent.useStore();
  const initialTankopediaState = tankopediaPersistentStore.getState();
  const protagonist = Duel.use((draft) => draft.protagonist);

  useTankTransform(protagonist, turretContainer, gunContainer);

  useEffect(() => {
    const unsubscribe = tankopediaPersistentStore.subscribe(
      (state) => state.mode,
      (mode) => {
        if (wrapper.current) wrapper.current.visible = mode === 'armor';
      },
    );

    return unsubscribe;
  });

  const tank = Duel.use((state) => state.protagonist.tank);
  const track = Duel.use((state) => state.protagonist.track);
  const turret = Duel.use((state) => state.protagonist.turret);
  const gun = Duel.use((state) => state.protagonist.gun);
  const armorGltf = useArmor(tank.id);
  const armorNodes = Object.values(armorGltf.nodes);
  const tankModelDefinition = modelDefinitions[tank.id];
  const trackModelDefinition = tankModelDefinition.tracks[track.id];
  const turretModelDefinition = tankModelDefinition.turrets[turret.id];
  const gunModelDefinition = turretModelDefinition.guns[gun.id];
  const hullOrigin = correctZYTuple(trackModelDefinition.origin);
  const turretOrigin = correctZYTuple(tankModelDefinition.turretOrigin);
  const gunOrigin = correctZYTuple(turretModelDefinition.gunOrigin);

  return (
    <ModelTankWrapper
      ref={wrapper}
      visible={initialTankopediaState.mode === 'armor'}
    >
      <group position={hullOrigin}>
        {armorNodes.map((node) => {
          const isHull = node.name.startsWith('hull_');
          const isVisible = isHull;
          const armorId = nameToArmorId(node.name);
          const { spaced, thickness } = resolveArmor(
            tankModelDefinition.armor,
            armorId,
          );

          if (!isVisible || spaced || thickness === undefined) return null;

          return (
            <CoreArmorSceneComponent
              key={node.uuid}
              thickness={thickness}
              node={node}
            />
          );
        })}
      </group>

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

          if (!isVisible || spaced || thickness === undefined) return null;

          return (
            <group key={node.uuid} position={turretOrigin}>
              <CoreArmorSceneComponent
                key={node.uuid}
                thickness={thickness}
                node={node}
              />
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

            if (!isVisible || spaced || thickness === undefined) return null;

            return (
              <group
                key={node.uuid}
                position={turretOrigin.clone().add(gunOrigin)}
              >
                <CoreArmorSceneComponent thickness={thickness} node={node} />
              </group>
            );
          })}
        </group>
      </group>
    </ModelTankWrapper>
  );
});
