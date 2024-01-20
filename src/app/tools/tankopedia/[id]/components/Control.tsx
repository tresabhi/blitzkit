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

const DISTANCE = 15;

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
  const tankModelDefinition = awaitedModelDefinitions[duel.protagonist.tank.id];
  const turretModelDefinition =
    tankModelDefinition.turrets[duel.protagonist.turret.id];
  const gunModelDefinition =
    turretModelDefinition.guns[duel.protagonist.gun.id];
  const turretOrigin = new Vector3(
    tankModelDefinition.turretOrigin[0],
    tankModelDefinition.turretOrigin[1],
    -tankModelDefinition.turretOrigin[2],
  );
  const gunOrigin = new Vector3(
    turretModelDefinition.gunOrigin[0],
    turretModelDefinition.gunOrigin[1],
    -turretModelDefinition.gunOrigin[2],
  );

  useEffect(() => {
    camera.position.set(-5, 4, -20);
    orbitControls.current?.target.set(0, 1.5, 0);

    const unsubscribeTankopedia = useTankopedia.subscribe(
      (state) => state.model.visual.controlsEnabled,
      (enabled) => {
        if (orbitControls.current) orbitControls.current.enabled = enabled;
      },
    );

    function handlePoseEvent(event: Pose) {
      const [pitch] = applyPitchYawLimits(
        -Infinity,
        0,
        gunModelDefinition.pitch,
        turretModelDefinition.yaw,
      );
      switch (event) {
        case Pose.HullDown: {
          camera.position
            .set(0, 0, 0)
            .add(turretOrigin)
            .add(gunOrigin)
            .add(
              new Vector3(
                0,
                DISTANCE * Math.sin(pitch),
                DISTANCE * -Math.cos(pitch),
              ),
            );
          camera.lookAt(turretOrigin.clone().add(gunOrigin));
          orbitControls.current?.target.set(0, 1.5, 0);
        }
      }
    }

    poseEvent.on(handlePoseEvent);

    return () => {
      unsubscribeTankopedia();
      poseEvent.off(handlePoseEvent);
    };
  }, [camera]);

  return (
    <OrbitControls
      ref={orbitControls}
      enabled={useTankopedia.getState().model.visual.controlsEnabled}
      rotateSpeed={0.25}
      enableDamping={false}
    />
  );
}
