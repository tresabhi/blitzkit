import { ThreeEvent, useLoader, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import {
  Euler,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector2,
  Vector3,
} from 'three';
import { GLTFLoader } from 'three-stdlib';
import { X_AXIS } from '../../../../../../../constants/axis';
import { applyPitchYawLimits } from '../../../../../../../core/blitz/applyPitchYawLimits';
import { asset } from '../../../../../../../core/blitzkrieg/asset';
import {
  ModelDefinitions,
  modelDefinitions,
} from '../../../../../../../core/blitzkrieg/modelDefinitions';
import { resolveJsxTree } from '../../../../../../../core/blitzkrieg/resolveJsxTree';
import { normalizeAnglePI } from '../../../../../../../core/math/normalizeAngle180';
import mutateTankopedia, {
  useTankopedia,
} from '../../../../../../../stores/tankopedia';

export function TankModel() {
  // "TypeError: dispatcher.use is not a function"
  // const awaitedModelDefinitions = use(modelDefinitions);
  const [awaitedModelDefinitions, setAwaitedModelDefinitions] = useState<
    ModelDefinitions | undefined
  >(undefined);
  const canvas = useThree((state) => state.gl.domElement);
  const protagonist = useTankopedia((state) => {
    if (!state.areTanksAssigned) return;
    return state.protagonist;
  });
  const model = useTankopedia((state) => state.model);
  const hullContainer = useRef<Group>(null);
  const turretContainer = useRef<Group>(null);
  const gunContainer = useRef<Group>(null);

  useEffect(() => {
    (async () => {
      setAwaitedModelDefinitions(await modelDefinitions);
    })();
  }, []);

  if (!protagonist) return null;

  const gltf = useLoader(
    GLTFLoader,
    asset(`3d/tanks/models/${protagonist.tank.id}.glb`),
  );
  const nodes = Object.values(gltf.nodes);

  if (!awaitedModelDefinitions) return null;

  const tankModelDefinition = awaitedModelDefinitions[protagonist.tank.id];
  const turretModelDefinition =
    tankModelDefinition.turrets[protagonist.turret.id];
  const gunModelDefinition = turretModelDefinition.guns[protagonist.gun.id];
  const turretOrigin = new Vector3(
    tankModelDefinition.turretOrigin[0],
    tankModelDefinition.turretOrigin[1],
    -tankModelDefinition.turretOrigin[2],
  ).applyAxisAngle(X_AXIS, Math.PI / 2);
  const gunOrigin = new Vector3(
    turretModelDefinition.gunOrigin[0],
    turretModelDefinition.gunOrigin[1],
    -turretModelDefinition.gunOrigin[2],
  ).applyAxisAngle(X_AXIS, Math.PI / 2);
  const turretPosition = new Vector3()
    .sub(turretOrigin)
    .applyAxisAngle(new Vector3(0, 0, 1), model.turretYaw);
  const turretRotation = new Euler(0, 0, model.turretYaw);

  if (tankModelDefinition.turretRotation) {
    const pitch = -tankModelDefinition.turretRotation.pitch * (Math.PI / 180);
    const yaw = -tankModelDefinition.turretRotation.yaw * (Math.PI / 180);
    const roll = -tankModelDefinition.turretRotation.roll * (Math.PI / 180);

    turretPosition
      .applyAxisAngle(new Vector3(1, 0, 0), pitch)
      .applyAxisAngle(new Vector3(0, 1, 0), roll)
      .applyAxisAngle(new Vector3(0, 0, 1), yaw);
    turretRotation.x += pitch;
    turretRotation.y += roll;
    turretRotation.z += yaw;
  }

  turretPosition.add(turretOrigin);

  return (
    <group ref={hullContainer} rotation={[-Math.PI / 2, 0, model.hullYaw]}>
      {nodes.map((node) => {
        const isHull = node.name === 'hull';
        const isWheel = node.name.startsWith('chassis_wheel_');
        const isTrack = node.name.startsWith('chassis_track_');
        const isVisible = isHull || isWheel || isTrack;
        let draftHullYaw = 0;

        function handlePointerDown(event: ThreeEvent<PointerEvent>) {
          event.stopPropagation();
          mutateTankopedia((draft) => {
            draft.model.controlsEnabled = false;
          });

          if (isHull) {
            draftHullYaw = model.hullYaw;

            window.addEventListener('pointermove', handlePointerMoveHull);
            window.addEventListener('pointerup', handlePointerUpHull);
          } else if (isTrack) {
            window.addEventListener('pointermove', handlePointerMoveTrack);
            window.addEventListener('pointerup', handlePointerUpTrack);
          }
        }
        function handlePointerMoveHull(event: PointerEvent) {
          draftHullYaw += event.movementX * ((2 * Math.PI) / canvas.width);
          if (hullContainer.current) {
            hullContainer.current.rotation.z = draftHullYaw;
          }
        }
        function handlePointerUpHull() {
          mutateTankopedia((draft) => {
            draft.model.controlsEnabled = true;
            draft.model.hullYaw = normalizeAnglePI(draftHullYaw);
          });
          window.removeEventListener('pointermove', handlePointerMoveHull);
          window.removeEventListener('pointerup', handlePointerUpHull);
        }
        function handlePointerMoveTrack(event: PointerEvent) {
          const mesh = node as Mesh;
          const material = mesh.material as MeshStandardMaterial;
          const offset = new Vector2(
            0,
            event.movementY * (6 / canvas.height) +
              event.movementX * (6 / canvas.width),
          );

          material.map?.offset.add(offset);
          material.roughnessMap?.offset.add(offset);
          material.normalMap?.offset.add(offset);
        }
        function handlePointerUpTrack() {
          mutateTankopedia((draft) => {
            draft.model.controlsEnabled = true;
          });
          window.removeEventListener('pointermove', handlePointerMoveTrack);
          window.removeEventListener('pointerup', handlePointerUpTrack);
        }

        if (!isVisible) return null;

        return (
          <mesh
            children={resolveJsxTree(node)}
            key={node.uuid}
            castShadow
            receiveShadow
            geometry={(node as Mesh).geometry}
            material={(node as Mesh).material}
            position={node.position}
            rotation={node.rotation}
            scale={node.scale}
            onPointerDown={handlePointerDown}
          />
        );
      })}

      <group
        position={turretPosition}
        rotation={turretRotation}
        ref={turretContainer}
      >
        {nodes.map((node) => {
          const isTurret = node.name.startsWith('turret_');
          const isCurrentTurret =
            node.name ===
            `turret_${turretModelDefinition.model.toString().padStart(2, '0')}`;
          const isVisible = isCurrentTurret;
          let draftPitch = 0;
          let draftYaw = 0;

          function handlePointerDown(event: ThreeEvent<PointerEvent>) {
            event.stopPropagation();

            if (isTurret) {
              draftYaw = model.turretYaw;
              draftPitch = model.gunPitch;

              mutateTankopedia((draft) => {
                draft.model.controlsEnabled = false;
              });
              window.addEventListener('pointermove', handlePointerMove);
              window.addEventListener('pointerup', handlePointerUp);
            }
          }
          function handlePointerMove(event: PointerEvent) {
            [draftPitch, draftYaw] = applyPitchYawLimits(
              draftPitch,
              draftYaw + event.movementX * (Math.PI / canvas.width),
              gunModelDefinition.pitch,
              turretModelDefinition.yaw,
            );

            if (gunContainer.current) {
              gunContainer.current.position
                .set(0, 0, 0)
                .sub(turretOrigin)
                .sub(gunOrigin)
                .applyAxisAngle(new Vector3(1, 0, 0), draftPitch)
                .add(turretOrigin)
                .add(gunOrigin);
              gunContainer.current.rotation.x = draftPitch;
            }

            if (turretContainer.current) {
              turretContainer.current.position
                .set(0, 0, 0)
                .sub(turretOrigin)
                .applyAxisAngle(new Vector3(0, 0, 1), draftYaw);
              turretContainer.current.rotation.z = draftYaw;

              if (tankModelDefinition.turretRotation) {
                const pitch =
                  -tankModelDefinition.turretRotation.pitch * (Math.PI / 180);
                const yaw =
                  -tankModelDefinition.turretRotation.yaw * (Math.PI / 180);
                const roll =
                  -tankModelDefinition.turretRotation.roll * (Math.PI / 180);

                turretContainer.current.position
                  .applyAxisAngle(new Vector3(1, 0, 0), pitch)
                  .applyAxisAngle(new Vector3(0, 1, 0), roll)
                  .applyAxisAngle(new Vector3(0, 0, 1), yaw);
              }

              turretContainer.current.position.add(turretOrigin);
            }
          }
          function handlePointerUp() {
            mutateTankopedia((state) => {
              state.model.controlsEnabled = true;
              state.model.gunPitch = normalizeAnglePI(draftPitch);
              state.model.turretYaw = normalizeAnglePI(draftYaw);
            });
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
          }

          if (!isVisible) return null;

          return (
            <mesh
              visible={isVisible}
              onPointerDown={handlePointerDown}
              children={resolveJsxTree(node)}
              key={node.uuid}
              castShadow
              receiveShadow
              geometry={(node as Mesh).geometry}
              material={(node as Mesh).material}
              position={node.position}
              rotation={node.rotation}
              scale={node.scale}
            />
          );
        })}

        <group
          position={new Vector3()
            .sub(turretOrigin)
            .sub(gunOrigin)
            .applyAxisAngle(new Vector3(1, 0, 0), model.gunPitch)
            .add(turretOrigin)
            .add(gunOrigin)}
          rotation={[model.gunPitch, 0, 0]}
          ref={gunContainer}
        >
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
            let draftPitch = 0;
            let draftYaw = 0;

            function handlePointerDown(event: ThreeEvent<PointerEvent>) {
              event.stopPropagation();

              mutateTankopedia((draft) => {
                draft.model.controlsEnabled = false;
              });
              draftPitch = model.gunPitch;
              draftYaw = model.turretYaw;
              window.addEventListener('pointermove', handlePointerMove);
              window.addEventListener('pointerup', handlePointerUp);
            }
            function handlePointerMove(event: PointerEvent) {
              [draftPitch, draftYaw] = applyPitchYawLimits(
                draftPitch - event.movementY * (Math.PI / canvas.height),
                draftYaw + event.movementX * (Math.PI / canvas.width),
                gunModelDefinition.pitch,
                turretModelDefinition.yaw,
              );

              if (gunContainer.current) {
                gunContainer.current.position
                  .set(0, 0, 0)
                  .sub(turretOrigin)
                  .sub(gunOrigin)
                  .applyAxisAngle(new Vector3(1, 0, 0), draftPitch)
                  .add(turretOrigin)
                  .add(gunOrigin);
                gunContainer.current.rotation.x = draftPitch;
              }

              if (turretContainer.current) {
                turretContainer.current.position
                  .set(0, 0, 0)
                  .sub(turretOrigin)
                  .applyAxisAngle(new Vector3(0, 0, 1), draftYaw);
                turretContainer.current.rotation.z = draftYaw;

                if (tankModelDefinition.turretRotation) {
                  const pitch =
                    -tankModelDefinition.turretRotation.pitch * (Math.PI / 180);
                  const yaw =
                    -tankModelDefinition.turretRotation.yaw * (Math.PI / 180);
                  const roll =
                    -tankModelDefinition.turretRotation.roll * (Math.PI / 180);

                  turretContainer.current.position
                    .applyAxisAngle(new Vector3(1, 0, 0), pitch)
                    .applyAxisAngle(new Vector3(0, 1, 0), roll)
                    .applyAxisAngle(new Vector3(0, 0, 1), yaw);
                }

                turretContainer.current.position.add(turretOrigin);
              }
            }
            function handlePointerUp() {
              mutateTankopedia((state) => {
                state.model.controlsEnabled = true;
                state.model.gunPitch = normalizeAnglePI(draftPitch);
                state.model.turretYaw = normalizeAnglePI(draftYaw);
              });
              window.removeEventListener('pointermove', handlePointerMove);
              window.removeEventListener('pointerup', handlePointerUp);
            }

            if (!isVisible) return null;

            return (
              <mesh
                visible={isVisible}
                onPointerDown={handlePointerDown}
                children={resolveJsxTree(node)}
                key={node.uuid}
                castShadow
                receiveShadow
                geometry={(node as Mesh).geometry}
                material={(node as Mesh).material}
                position={node.position}
                rotation={node.rotation}
                scale={node.scale}
              />
            );
          })}
        </group>
      </group>
    </group>
  );
}
