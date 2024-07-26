import { memo, useMemo, useRef } from 'react';
import { Group, Plane, Scene, Vector3 } from 'three';
import { correctZYTuple } from '../../../core/blitz/correctZYTuple';
import { nameToArmorId } from '../../../core/blitzkit/nameToArmorId';
import { resolveArmor } from '../../../core/blitzkit/resolveThickness';
import { TankDefinitions } from '../../../core/blitzkit/tankDefinitions';
import { useArmor } from '../../../hooks/useArmor';
import { useModel } from '../../../hooks/useModel';
import { useModelDefinitions } from '../../../hooks/useModelDefinitions';
import { useTankTransform } from '../../../hooks/useTankTransform';
import * as Duel from '../../../stores/duel';
import { ModelTankWrapper } from '../../Armor/components/ModelTankWrapper';
import { ArmorType } from '../../Armor/components/SpacedArmorScene';
import { SpacedArmorSceneComponent } from '../../Armor/components/SpacedArmorSceneComponent';

interface StaticArmorSceneProps {
  scene: Scene;
  awaitedTankDefinitions: TankDefinitions;
}

export interface ThicknessRange {
  max: number;
}

export const StaticArmorScene = memo<StaticArmorSceneProps>(
  ({ scene, awaitedTankDefinitions }) => {
    const wrapper = useRef<Group>(null);
    const awaitedTankModelDefinitions = useModelDefinitions();
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
    const tankModelDefinition = awaitedTankModelDefinitions[tank.id];
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
    const thicknessRange = useMemo(() => {
      const thicknesses = Object.values(awaitedTankDefinitions)
        .filter((thisTank) => thisTank.tier === tank.tier)
        .map((tank) => awaitedTankModelDefinitions[tank.id])
        .filter(Boolean)
        .map((model) => {
          const tankThicknesses = Object.values(model.armor.thickness);
          const trackThicknesses = Object.values(model.tracks)
            .map((track) => track.thickness)
            .flat();
          const turretThicknesses = Object.values(model.turrets)
            .map((turret) => {
              const turretThicknesses = Object.values(turret.armor.thickness);
              const gunThicknesses = Object.values(turret.guns)
                .map((gun) => {
                  return Object.values(gun.armor.thickness);
                })
                .flat();

              return [...turretThicknesses, ...gunThicknesses];
            })
            .flat();

          return [
            ...tankThicknesses,
            ...trackThicknesses,
            ...turretThicknesses,
          ];
        })
        .flat();

      const max = Math.max(...thicknesses) * 0.75;

      return { max } satisfies ThicknessRange;
    }, [tank.tier]);

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

            if (!isVisible || thickness === undefined) return null;

            return (
              <SpacedArmorSceneComponent
                thicknessRange={thicknessRange}
                static
                scene={scene}
                key={node.uuid}
                type={spaced ? ArmorType.Spaced : ArmorType.Core}
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
              thicknessRange={thicknessRange}
              static
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

            if (!isVisible || thickness === undefined) return null;

            return (
              <group key={node.uuid} position={turretOrigin}>
                <SpacedArmorSceneComponent
                  thicknessRange={thicknessRange}
                  static
                  scene={scene}
                  key={node.uuid}
                  type={spaced ? ArmorType.Spaced : ArmorType.Core}
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

              if (!isVisible || thickness === undefined) return null;

              return (
                <group
                  key={node.uuid}
                  position={turretOrigin.clone().add(gunOrigin)}
                >
                  <SpacedArmorSceneComponent
                    thicknessRange={thicknessRange}
                    static
                    scene={scene}
                    type={spaced ? ArmorType.Spaced : ArmorType.Core}
                    thickness={thickness}
                    node={node}
                  />
                </group>
              );
            })}

            {modelNodes.map((node) => {
              const gunString = `gun_${gunModelDefinition.model.toString().padStart(2, '0')}`;
              const isCurrentGun = gunModelDefinition.mask
                ? node.name.startsWith(gunString)
                : node.name === gunString;
              const isVisible = isCurrentGun;

              if (!isVisible) return null;

              return (
                <SpacedArmorSceneComponent
                  thicknessRange={thicknessRange}
                  static
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
  },
);
