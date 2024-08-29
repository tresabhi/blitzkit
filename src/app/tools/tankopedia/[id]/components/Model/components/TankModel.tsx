import { invalidate, ThreeEvent, useThree } from '@react-three/fiber';
import { memo, useRef } from 'react';
import { Group, Mesh, MeshStandardMaterial, Vector2 } from 'three';
import { ModelTankWrapper } from '../../../../../../../components/Armor/components/ModelTankWrapper';
import { applyPitchYawLimits } from '../../../../../../../core/blitz/applyPitchYawLimits';
import { hasEquipment } from '../../../../../../../core/blitzkit/hasEquipment';
import { jsxTree } from '../../../../../../../core/blitzkit/jsxTree';
import { modelTransformEvent } from '../../../../../../../core/blitzkit/modelTransform';
import { normalizeAngleRad } from '../../../../../../../core/math/normalizeAngleRad';
import { useModel } from '../../../../../../../hooks/useModel';
import { useTankModelDefinition } from '../../../../../../../hooks/useTankModelDefinition';
import { useTankTransform } from '../../../../../../../hooks/useTankTransform';
import * as Duel from '../../../../../../../stores/duel';
import * as TankopediaEphemeral from '../../../../../../../stores/tankopediaEphemeral';
import * as TankopediaPersistent from '../../../../../../../stores/tankopediaPersistent';
import { TankopediaDisplay } from '../../../../../../../stores/tankopediaPersistent/constants';

export const TankModel = memo(() => {
  const mutateDuel = Duel.useMutation();
  const duelStore = Duel.useStore();
  const protagonist = Duel.use((draft) => draft.protagonist);
  const tankopediaPersistentStore = TankopediaPersistent.useStore();
  const canvas = useThree((state) => state.gl.domElement);
  const hullContainer = useRef<Group>(null);
  const turretContainer = useRef<Group>(null);
  const gunContainer = useRef<Group>(null);
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();
  const tankModelDefinition = useTankModelDefinition();
  const turretModelDefinition =
    tankModelDefinition.turrets[protagonist.turret.id];
  const gunModelDefinition = turretModelDefinition.guns[protagonist.gun.id];
  const { gltf } = useModel(protagonist.tank.id);
  const nodes = Object.values(gltf.nodes);

  useTankTransform(protagonist, turretContainer, gunContainer);

  return (
    <ModelTankWrapper ref={hullContainer}>
      {nodes.map((node) => {
        const isHull = node.name === 'hull';
        const isWheel = node.name.startsWith('chassis_wheel_');
        const isTrack = node.name.startsWith('chassis_track_');
        const isVisible = isHull || isWheel || isTrack;
        const position = new Vector2();
        const delta = new Vector2();

        if (!isVisible) return null;

        console.log(node.name);

        function translateTexture(offset: number) {
          const mesh = node.children[0] as Mesh;
          const material = mesh?.material as MeshStandardMaterial;

          if (!material) return;

          invalidate();

          if (material.map) material.map.offset.y += offset;
          if (material.aoMap) material.aoMap.offset.y += offset;
          if (material.normalMap) material.normalMap.offset.y += offset;
          if (material.roughnessMap) material.roughnessMap.offset.y += offset;
          if (material.metalnessMap) material.metalnessMap.offset.y += offset;
        }

        function onPointerDown(event: ThreeEvent<PointerEvent>) {
          if (
            isTrack &&
            tankopediaPersistentStore.getState().display ===
              TankopediaDisplay.Model
          ) {
            position.set(event.clientX, event.clientY);
            event.stopPropagation();

            mutateTankopediaEphemeral((draft) => {
              draft.controlsEnabled = false;
            });

            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
          } else {
            event.stopPropagation();
          }
        }
        function handlePointerMove(event: PointerEvent) {
          delta.set(event.clientX, event.clientY).sub(position);
          position.set(event.clientX, event.clientY);
          const deltaX = delta.x / window.innerWidth;
          const deltaY = delta.y / window.innerHeight;

          translateTexture(deltaX + deltaY);
        }
        function handlePointerUp() {
          mutateTankopediaEphemeral((draft) => {
            draft.controlsEnabled = true;
          });

          window.removeEventListener('pointermove', handlePointerMove);
          window.removeEventListener('pointerup', handlePointerUp);
        }

        return jsxTree(
          node,
          {
            castShadow: true,
            receiveShadow: true,
            onPointerDown,
          },
          node.uuid,
        );
      })}

      <group ref={turretContainer}>
        {nodes.map((node) => {
          const isTurret = node.name.startsWith('turret_');
          const isCurrentTurret =
            node.name ===
            `turret_${turretModelDefinition.model.toString().padStart(2, '0')}`;
          const isVisible = isCurrentTurret;
          const position = new Vector2();
          const delta = new Vector2();

          if (!isVisible) return null;

          let pitch = 0;
          let yaw = 0;

          function onPointerDown(event: ThreeEvent<PointerEvent>) {
            event.stopPropagation();

            if (!isTurret) return;

            position.set(event.clientX, event.clientY);
            yaw = protagonist.yaw;
            pitch = protagonist.pitch;

            mutateTankopediaEphemeral((draft) => {
              draft.controlsEnabled = false;
            });
            mutateTankopediaEphemeral((draft) => {
              draft.shot = undefined;
              draft.highlightArmor = undefined;
            });
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
          }
          async function handlePointerMove(event: PointerEvent) {
            const duel = duelStore.getState();
            const hasImprovedVerticalStabilizer = await hasEquipment(
              122,
              duel.protagonist.tank.equipment,
              duel.protagonist.equipmentMatrix,
            );
            const boundingRect = canvas.getBoundingClientRect();

            delta.set(event.clientX, event.clientY).sub(position);
            position.set(event.clientX, event.clientY);

            [pitch, yaw] = applyPitchYawLimits(
              pitch,
              yaw + delta.x * (Math.PI / boundingRect.width),
              gunModelDefinition.pitch,
              turretModelDefinition.yaw,
              hasImprovedVerticalStabilizer,
            );
            modelTransformEvent.emit({ pitch, yaw });
          }
          function handlePointerUp() {
            mutateDuel((draft) => {
              draft.protagonist.pitch = normalizeAngleRad(pitch);
              draft.protagonist.yaw = normalizeAngleRad(yaw);
            });
            mutateTankopediaEphemeral((draft) => {
              draft.controlsEnabled = true;
            });
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
          }

          return jsxTree(
            node,
            {
              castShadow: true,
              receiveShadow: true,
              onPointerDown,
            },
            node.uuid,
          );
        })}

        <group ref={gunContainer}>
          {nodes.map((node) => {
            const isCurrentMantlet =
              node.name ===
              `gun_${gunModelDefinition.model
                .toString()
                .padStart(2, '0')}_mask`;
            const isCurrentGun =
              node.name ===
              `gun_${gunModelDefinition.model.toString().padStart(2, '0')}`;
            const isVisible = isCurrentGun || isCurrentMantlet;
            const position = new Vector2();
            const delta = new Vector2();

            if (!isVisible) return null;

            let pitch = 0;
            let yaw = 0;

            function onPointerDown(event: ThreeEvent<PointerEvent>) {
              event.stopPropagation();

              mutateTankopediaEphemeral((draft) => {
                draft.controlsEnabled = false;
              });
              mutateTankopediaEphemeral((draft) => {
                draft.shot = undefined;
                draft.highlightArmor = undefined;
              });

              position.set(event.clientX, event.clientY);
              pitch = protagonist.pitch;
              yaw = protagonist.yaw;

              window.addEventListener('pointermove', handlePointerMove);
              window.addEventListener('pointerup', handlePointerUp);
            }
            async function handlePointerMove(event: PointerEvent) {
              const duel = duelStore.getState();
              const hasImprovedVerticalStabilizer = await hasEquipment(
                122,
                duel.protagonist.tank.equipment,
                duel.protagonist.equipmentMatrix,
              );
              const boundingRect = canvas.getBoundingClientRect();
              delta.set(event.clientX, event.clientY).sub(position);
              position.set(event.clientX, event.clientY);

              [pitch, yaw] = applyPitchYawLimits(
                pitch - delta.y * (Math.PI / boundingRect.height),
                yaw + delta.x * (Math.PI / boundingRect.width),
                gunModelDefinition.pitch,
                turretModelDefinition.yaw,
                hasImprovedVerticalStabilizer,
              );
              modelTransformEvent.emit({ pitch, yaw });
            }
            function handlePointerUp() {
              mutateTankopediaEphemeral((draft) => {
                draft.controlsEnabled = true;
              });
              mutateDuel((draft) => {
                draft.protagonist.pitch = normalizeAngleRad(pitch);
                draft.protagonist.yaw = normalizeAngleRad(yaw);
              });
              window.removeEventListener('pointermove', handlePointerMove);
              window.removeEventListener('pointerup', handlePointerUp);
            }

            return jsxTree(
              node,
              {
                castShadow: true,
                receiveShadow: true,
                onPointerDown,
              },
              node.uuid,
            );
          })}
        </group>
      </group>
    </ModelTankWrapper>
  );
});
