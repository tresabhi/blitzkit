import { ThreeEvent, useLoader, useThree } from '@react-three/fiber';
import { memo, useEffect, useRef, useState } from 'react';
import {
  Euler,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector2,
  Vector3,
} from 'three';
import { GLTFLoader } from 'three-stdlib';
import { degToRad } from 'three/src/math/MathUtils';
import { X_AXIS, Y_AXIS, Z_AXIS } from '../../../../../../../constants/axis';
import { applyPitchYawLimits } from '../../../../../../../core/blitz/applyPitchYawLimits';
import { asset } from '../../../../../../../core/blitzkrieg/asset';
import {
  ModelDefinitions,
  modelDefinitions,
} from '../../../../../../../core/blitzkrieg/modelDefinitions';
import {
  ModelTransformEventData,
  modelTransformEvent,
} from '../../../../../../../core/blitzkrieg/modelTransform';
import { resolveJsxTree } from '../../../../../../../core/blitzkrieg/resolveJsxTree';
import { normalizeAnglePI } from '../../../../../../../core/math/normalizeAngle180';
import mutateTankopedia, {
  useTankopedia,
} from '../../../../../../../stores/tankopedia';

export const TankModel = memo(() => {
  const [awaitedModelDefinitions, setAwaitedModelDefinitions] = useState<
    ModelDefinitions | undefined
  >(undefined);
  const protagonist = useTankopedia((state) => {
    if (!state.areTanksAssigned) return;
    return state.protagonist;
  });

  if (!protagonist) return null;

  const canvas = useThree((state) => state.gl.domElement);
  const physical = useTankopedia((state) => state.model.physical);
  const hullContainer = useRef<Group>(null);
  const turretContainer = useRef<Group>(null);
  const gunContainer = useRef<Group>(null);

  useEffect(() => {
    (async () => {
      setAwaitedModelDefinitions(await modelDefinitions);
    })();
  }, []);

  useEffect(() => {
    if (!awaitedModelDefinitions) return;

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
    const turretPosition = new Vector3();
    const turretRotation = new Euler();
    const gunPosition = new Vector3();
    const gunRotation = new Euler();

    function handleModelTransform({ yaw, pitch }: ModelTransformEventData) {
      gunPosition
        .set(0, 0, 0)
        .sub(turretOrigin)
        .sub(gunOrigin)
        .applyAxisAngle(X_AXIS, pitch)
        .add(gunOrigin)
        .add(turretOrigin);
      gunRotation.set(pitch, 0, 0);
      gunContainer.current?.position.copy(gunPosition);
      gunContainer.current?.rotation.copy(gunRotation);

      if (yaw === undefined) return;

      turretPosition
        .set(0, 0, 0)
        .sub(turretOrigin)
        .applyAxisAngle(new Vector3(0, 0, 1), yaw);
      turretRotation.set(0, 0, yaw);

      if (tankModelDefinition.turretRotation) {
        const initialPitch = -degToRad(
          tankModelDefinition.turretRotation.pitch,
        );
        const initialYaw = -degToRad(tankModelDefinition.turretRotation.yaw);
        const initialRoll = -degToRad(tankModelDefinition.turretRotation.roll);

        turretPosition
          .applyAxisAngle(X_AXIS, initialPitch)
          .applyAxisAngle(Y_AXIS, initialRoll)
          .applyAxisAngle(Z_AXIS, initialYaw);
        turretRotation.x += initialPitch;
        turretRotation.y += initialRoll;
        turretRotation.z += initialYaw;
      }

      turretPosition.add(turretOrigin);
      turretContainer.current?.position.copy(turretPosition);
      turretContainer.current?.rotation.copy(turretRotation);
    }

    modelTransformEvent.on(handleModelTransform);

    return () => {
      modelTransformEvent.off(handleModelTransform);
    };
  });

  if (!awaitedModelDefinitions) return;

  const tankModelDefinition = awaitedModelDefinitions[protagonist.tank.id];
  const turretModelDefinition =
    tankModelDefinition.turrets[protagonist.turret.id];
  const gunModelDefinition = turretModelDefinition.guns[protagonist.gun.id];

  const gltf = useLoader(
    GLTFLoader,
    asset(`3d/tanks/models/${protagonist.tank.id}.glb`),
  );
  const nodes = Object.values(gltf.nodes);

  return (
    <group ref={hullContainer} rotation={[-Math.PI / 2, 0, 0]}>
      {nodes.map((node) => {
        const isHull = node.name === 'hull';
        const isWheel = node.name.startsWith('chassis_wheel_');
        const isTrack = node.name.startsWith('chassis_track_');
        const isVisible = isHull || isWheel || isTrack;

        function handlePointerDown(event: ThreeEvent<PointerEvent>) {
          event.stopPropagation();
          mutateTankopedia((draft) => {
            draft.model.visual.controlsEnabled = false;
          });

          if (isTrack) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
          }
        }
        function handlePointerMove(event: PointerEvent) {
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
        function handlePointerUp() {
          mutateTankopedia((draft) => {
            draft.model.visual.controlsEnabled = true;
          });
          window.removeEventListener('pointermove', handlePointerMove);
          window.removeEventListener('pointerup', handlePointerUp);
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

      <group ref={turretContainer}>
        {nodes.map((node) => {
          const isTurret = node.name.startsWith('turret_');
          const isCurrentTurret =
            node.name ===
            `turret_${turretModelDefinition.model.toString().padStart(2, '0')}`;
          const isVisible = isCurrentTurret;
          let pitch = 0;
          let yaw = 0;

          function handlePointerDown(event: ThreeEvent<PointerEvent>) {
            event.stopPropagation();

            if (isTurret) {
              yaw = physical.yaw;
              pitch = physical.pitch;

              mutateTankopedia((draft) => {
                draft.model.visual.controlsEnabled = false;
              });
              window.addEventListener('pointermove', handlePointerMove);
              window.addEventListener('pointerup', handlePointerUp);
            }
          }
          function handlePointerMove(event: PointerEvent) {
            [pitch, yaw] = applyPitchYawLimits(
              pitch,
              yaw + event.movementX * (Math.PI / canvas.width),
              gunModelDefinition.pitch,
              turretModelDefinition.yaw,
            );
            modelTransformEvent.emit({ pitch, yaw });
          }
          function handlePointerUp() {
            mutateTankopedia((state) => {
              state.model.visual.controlsEnabled = true;
              state.model.physical.pitch = normalizeAnglePI(pitch);
              state.model.physical.yaw = normalizeAnglePI(yaw);
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
            let pitch = 0;
            let yaw = 0;

            function handlePointerDown(event: ThreeEvent<PointerEvent>) {
              event.stopPropagation();

              mutateTankopedia((draft) => {
                draft.model.visual.controlsEnabled = false;
              });
              pitch = physical.pitch;
              yaw = physical.yaw;
              window.addEventListener('pointermove', handlePointerMove);
              window.addEventListener('pointerup', handlePointerUp);
            }
            function handlePointerMove(event: PointerEvent) {
              [pitch, yaw] = applyPitchYawLimits(
                pitch - event.movementY * (Math.PI / canvas.height),
                yaw + event.movementX * (Math.PI / canvas.width),
                gunModelDefinition.pitch,
                turretModelDefinition.yaw,
              );
              modelTransformEvent.emit({ pitch, yaw });
            }
            function handlePointerUp() {
              mutateTankopedia((state) => {
                state.model.visual.controlsEnabled = true;
                state.model.physical.pitch = normalizeAnglePI(pitch);
                state.model.physical.yaw = normalizeAnglePI(yaw);
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
});
