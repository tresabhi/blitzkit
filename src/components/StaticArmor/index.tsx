import { memo, useRef } from 'react';
import { Group, Plane, Vector3 } from 'three';
import { correctZYTuple } from '../../core/blitz/correctZYTuple';
import { nameToArmorId } from '../../core/blitzkit/nameToArmorId';
import { resolveArmor } from '../../core/blitzkit/resolveThickness';
import { useArmor } from '../../hooks/useArmor';
import { useModel } from '../../hooks/useModel';
import { useTankModelDefinition } from '../../hooks/useTankModelDefinition';
import { useTankTransform } from '../../hooks/useTankTransform';
import * as Duel from '../../stores/duel';
import * as TankopediaPersistent from '../../stores/tankopediaPersistent';
import { ModelTankWrapper } from '../Armor/components/ModelTankWrapper';
import { ArmorType } from '../Armor/components/SpacedArmorScene';
import { StaticArmorSceneComponent } from '../Armor/components/StaticArmorSceneComponent';

interface ArmorSceneProps {
  thicknessRange: ThicknessRange;
}

export interface ThicknessRange {
  value: number;
}

export const StaticArmor = memo<ArmorSceneProps>(({ thicknessRange }) => {
  const wrapper = useRef<Group>(null);
  const turretContainer = useRef<Group>(null);
  const gunContainer = useRef<Group>(null);
  const protagonist = Duel.use((draft) => draft.protagonist);
  const tank = Duel.use((state) => state.protagonist.tank);
  const track = Duel.use((state) => state.protagonist.track);
  const turret = Duel.use((state) => state.protagonist.turret);
  const gun = Duel.use((state) => state.protagonist.gun);
  const armorGltf = useArmor(tank.id);
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
  const showPrimaryArmor = TankopediaPersistent.use(
    (state) => state.model.visual.showPrimaryArmor,
  );
  const showSpacedArmor = TankopediaPersistent.use(
    (state) => state.model.visual.showSpacedArmor,
  );
  const showExternalModules = TankopediaPersistent.use(
    (state) => state.model.visual.showExternalModules,
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
            (!showPrimaryArmor && !spaced) ||
            (!showSpacedArmor && spaced)
          )
            return null;

          return (
            <StaticArmorSceneComponent
              name={node.name}
              thicknessRange={thicknessRange}
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

        if (!isVisible || !showExternalModules) return null;

        return (
          <StaticArmorSceneComponent
            name={node.name}
            thicknessRange={thicknessRange}
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
            (!showPrimaryArmor && !spaced) ||
            (!showSpacedArmor && spaced)
          )
            return null;

          return (
            <group position={hullOrigin}>
              <group key={node.uuid} position={turretOrigin}>
                <StaticArmorSceneComponent
                  name={node.name}
                  thicknessRange={thicknessRange}
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
              (!showPrimaryArmor && !spaced) ||
              (!showSpacedArmor && spaced)
            )
              return null;

            return (
              <group position={hullOrigin}>
                <group
                  key={node.uuid}
                  position={turretOrigin.clone().add(gunOrigin)}
                >
                  <StaticArmorSceneComponent
                    name={node.name}
                    thicknessRange={thicknessRange}
                    type={spaced ? ArmorType.Spaced : ArmorType.Primary}
                    thickness={thickness}
                    node={node}
                  />
                </group>
              </group>
            );
          })}

          {modelNodes.map((node) => {
            const gunString = `gun_${gunModelDefinition.model.toString().padStart(2, '0')}`;
            const isCurrentGun = gunModelDefinition.mask
              ? node.name.startsWith(gunString)
              : node.name === gunString;
            const isVisible = isCurrentGun;

            if (!isVisible || !showExternalModules) return null;

            return (
              <StaticArmorSceneComponent
                name={node.name}
                thicknessRange={thicknessRange}
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
