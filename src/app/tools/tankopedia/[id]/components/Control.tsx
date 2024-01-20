import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import usePromise from 'react-promise-suspense';
import { Vector3 } from 'three';
import { OrbitControls as OrbitControlsClass } from 'three-stdlib';
import { applyPitchYawLimits } from '../../../../../core/blitz/applyPitchYawLimits';
import { modelDefinitions } from '../../../../../core/blitzkrieg/modelDefinitions';
import { Pose, poseEvent } from '../../../../../core/blitzkrieg/pose';
import { useTankopedia } from '../../../../../stores/tankopedia';
import { Duel } from '../page';

const poseDistances: Record<Pose, number> = {
  [Pose.HullDown]: 15,
  [Pose.FaceHug]: 5,
  [Pose.Default]: -1,
};

interface ControlsProps {
  duel: Duel;
}

export function Controls({ duel }: ControlsProps) {
  const camera = useThree((state) => state.camera);
  const orbitControls = useRef<OrbitControlsClass>(null);
  const awaitedModelDefinitions = usePromise(
    async () => await modelDefinitions,
    [],
  );
  const protagonistModelDefinition =
    awaitedModelDefinitions[duel.protagonist.tank.id];
  const antagonistModelDefinition =
    awaitedModelDefinitions[duel.antagonist.tank.id];
  const protagonistTurretModelDefinition =
    protagonistModelDefinition.turrets[duel.protagonist.turret.id];
  const antagonistTurretModelDefinition =
    antagonistModelDefinition.turrets[duel.antagonist.turret.id];
  const protagonistGunModelDefinition =
    protagonistTurretModelDefinition.guns[duel.protagonist.gun.id];
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
    antagonistModelDefinition.turretOrigin[1] +
    antagonistTurretModelDefinition.gunOrigin[1];

  useEffect(() => {
    camera.position.set(-4, 4, -16);
    orbitControls.current?.target.set(0, antagonistGunHeight / 2, 0);

    const unsubscribeTankopedia = useTankopedia.subscribe(
      (state) => state.model.visual.controlsEnabled,
      (enabled) => {
        if (orbitControls.current) orbitControls.current.enabled = enabled;
      },
    );

    function handlePoseEvent(event: Pose) {
      switch (event) {
        case Pose.HullDown: {
          const [pitch] = applyPitchYawLimits(
            -Infinity,
            0,
            protagonistGunModelDefinition.pitch,
            protagonistTurretModelDefinition.yaw,
          );

          camera.position
            .set(0, 0, 0)
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
            protagonistTurretOrigin.clone().add(protagonistGunOrigin),
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
          );

          camera.position
            .set(0, 0, 0)
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
          camera.position.set(-4, 4, -16);
          orbitControls.current?.target.set(0, antagonistGunHeight / 2, 0);
          break;
        }
      }
    }

    poseEvent.on(handlePoseEvent);

    return () => {
      unsubscribeTankopedia();
      poseEvent.off(handlePoseEvent);
    };
  }, [camera, duel.protagonist.tank.id, duel.antagonist.tank.id]);

  return (
    <OrbitControls
      ref={orbitControls}
      enabled={useTankopedia.getState().model.visual.controlsEnabled}
      rotateSpeed={0.25}
      enableDamping={false}
    />
  );
}
