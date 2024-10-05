import { fetchModelDefinitions } from '@blitzkit/core';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Vector3 } from 'three';
import { OrbitControls as OrbitControlsClass } from 'three-stdlib';
import { applyPitchYawLimits } from '../../../../../../core/blitz/applyPitchYawLimits';
import { hasEquipment } from '../../../../../../core/blitzkit/hasEquipment';
import { Pose, poseEvent } from '../../../../../../core/blitzkit/pose';
import { Duel } from '../../../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../../../stores/tankopediaEphemeral';

const initialPosition = [0, 4, -18] as const;
const poseDistances: Record<Pose, number> = {
  [Pose.HullDown]: 15,
  [Pose.FaceHug]: 5,
  [Pose.Default]: -1,
};

const modelDefinitions = await fetchModelDefinitions();

export function Controls() {
  const duelStore = Duel.useStore();
  const tankopediaEphemeralStore = TankopediaEphemeral.useStore();
  const camera = useThree((state) => state.camera);
  const canvas = useThree((state) => state.gl.domElement);
  const orbitControls = useRef<OrbitControlsClass>(null);
  const protagonist = Duel.use((state) => state.protagonist);
  const antagonist = Duel.use((state) => state.antagonist);
  const protagonistModelDefinition =
    modelDefinitions.models[protagonist.tank.id];
  const protagonistTrackModelDefinition =
    modelDefinitions.models[protagonist.tank.id].tracks[protagonist.track.id];
  const antagonistModelDefinition = modelDefinitions.models[antagonist.tank.id];
  const protagonistTurretModelDefinition =
    protagonistModelDefinition.turrets[protagonist.turret.id];
  const antagonistTurretModelDefinition =
    antagonistModelDefinition.turrets[antagonist.turret.id];
  const protagonistGunModelDefinition =
    protagonistTurretModelDefinition.guns[protagonist.gun.id];
  const protagonistHullOrigin = new Vector3(
    protagonistTrackModelDefinition.origin[0],
    protagonistTrackModelDefinition.origin[1],
    -protagonistTrackModelDefinition.origin[2],
  );
  const protagonistTurretOrigin = new Vector3(
    protagonistModelDefinition.turretOrigin[0],
    protagonistModelDefinition.turretOrigin[1],
    -protagonistModelDefinition.turretOrigin[2],
  );
  const protagonistGunOrigin = new Vector3(
    protagonistTurretModelDefinition.gunOrigin[0],
    protagonistTurretModelDefinition.gunOrigin[1],
    -protagonistTurretModelDefinition.gunOrigin[2],
  );
  const antagonistGunHeight =
    protagonistTrackModelDefinition.origin[1] +
    antagonistModelDefinition.turretOrigin[1] +
    antagonistTurretModelDefinition.gunOrigin[1];
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    camera.position.set(...initialPosition);
    orbitControls.current?.target.set(0, 1.25, 0);
  }, [camera]);

  useEffect(() => {
    const unsubscribeTankopediaEphemeral = tankopediaEphemeralStore.subscribe(
      (state) => state.controlsEnabled,
      (enabled) => {
        if (orbitControls.current) orbitControls.current.enabled = enabled;
      },
    );

    async function handlePoseEvent(event: Pose) {
      const duel = duelStore.getState();
      const hasImprovedVerticalStabilizer = await hasEquipment(
        122,
        duel.protagonist.tank.equipment,
        duel.protagonist.equipmentMatrix,
      );

      switch (event) {
        case Pose.HullDown: {
          const [pitch] = applyPitchYawLimits(
            -Infinity,
            0,
            protagonistGunModelDefinition.pitch,
            protagonistTurretModelDefinition.yaw,
            hasImprovedVerticalStabilizer,
          );

          camera.position
            .set(0, 0, 0)
            .add(protagonistHullOrigin)
            .add(protagonistTurretOrigin)
            .add(protagonistGunOrigin)
            .add(
              new Vector3(
                0,
                poseDistances[event] * Math.sin(pitch),
                poseDistances[event] * -Math.cos(pitch),
              ),
            );
          camera.lookAt(
            protagonistHullOrigin
              .clone()
              .add(protagonistTurretOrigin)
              .add(protagonistGunOrigin),
          );
          orbitControls.current?.target.set(0, antagonistGunHeight, 0);

          break;
        }

        case Pose.FaceHug: {
          const [pitch] = applyPitchYawLimits(
            0,
            0,
            protagonistGunModelDefinition.pitch,
            protagonistTurretModelDefinition.yaw,
            hasImprovedVerticalStabilizer,
          );

          camera.position
            .set(0, 0, 0)
            .add(protagonistHullOrigin)
            .add(protagonistTurretOrigin)
            .add(protagonistGunOrigin)
            .add(
              new Vector3(
                0,
                poseDistances[event] * Math.sin(pitch),
                poseDistances[event] * -Math.cos(pitch),
              ),
            );
          orbitControls.current?.target
            .set(0, 0, 0)
            .add(protagonistHullOrigin)
            .add(protagonistTurretOrigin)
            .add(protagonistGunOrigin)
            .add(
              new Vector3(
                0,
                0.5 * poseDistances[event] * Math.sin(pitch),
                0.5 * poseDistances[event] * -Math.cos(pitch),
              ),
            );

          break;
        }

        case Pose.Default: {
          camera.position.set(...initialPosition);
          orbitControls.current?.target.set(0, 1.25, 0);
          break;
        }
      }
    }

    poseEvent.on(handlePoseEvent);

    return () => {
      unsubscribeTankopediaEphemeral();
      poseEvent.off(handlePoseEvent);
    };
  }, [camera, protagonist.tank.id, antagonist.tank.id]);

  useEffect(() => {
    function handleDisturbance() {
      setAutoRotate(false);
    }

    poseEvent.on(handleDisturbance);
    canvas.addEventListener('pointerdown', handleDisturbance);

    return () => {
      canvas.removeEventListener('pointerdown', handleDisturbance);
      poseEvent.off(handleDisturbance);
    };
  }, []);

  return (
    <OrbitControls
      maxDistance={20}
      minDistance={5}
      ref={orbitControls}
      enabled={tankopediaEphemeralStore.getState().controlsEnabled}
      rotateSpeed={0.25}
      enableDamping={false}
      autoRotate={autoRotate}
      autoRotateSpeed={1 / 4}
    />
  );
}
