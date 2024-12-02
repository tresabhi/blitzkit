import { OrbitControls } from '@react-three/drei';
import { invalidate, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { AxesHelper, PerspectiveCamera, Vector2, Vector3 } from 'three';
import { OrbitControls as OrbitControlsClass } from 'three-stdlib';
import { degToRad } from 'three/src/math/MathUtils.js';
import { awaitableModelDefinitions } from '../../../../../../core/awaitables/modelDefinitions';
import { applyPitchYawLimits } from '../../../../../../core/blitz/applyPitchYawLimits';
import { hasEquipment } from '../../../../../../core/blitzkit/hasEquipment';
import { Pose, poseEvent } from '../../../../../../core/blitzkit/pose';
import { Duel } from '../../../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../../../stores/tankopediaEphemeral';
import { TankopediaDisplay } from '../../../../../../stores/tankopediaPersistent/constants';

const poseDistances: Record<Pose, number> = {
  [Pose.HullDown]: 15,
  [Pose.FaceHug]: 5,
  [Pose.Default]: -1,
};

const modelDefinitions = await awaitableModelDefinitions;

const ARCADE_MODE_DISTANCE = 16;
const ARCADE_MODE_ANGLE = Math.PI / 8;
export const ARCADE_MODE_FOV = 54;
export const INSPECT_MODE_FOV = 25;

const emptyVector = new Vector2();

export function Controls() {
  const helper = useRef<AxesHelper>(null);
  const display = TankopediaEphemeral.use((state) => state.display);
  const duelStore = Duel.useStore();
  const tankopediaEphemeralStore = TankopediaEphemeral.useStore();
  const camera = useThree((state) => state.camera);
  const canvas = useThree((state) => state.gl.domElement);
  const orbitControls = useRef<OrbitControlsClass>(null);
  const protagonistTurret = Duel.use((state) => state.protagonist.turret);
  const antagonistTurret = Duel.use((state) => state.antagonist.turret);
  const protagonistTrack = Duel.use((state) => state.protagonist.track);
  const protagonistTank = Duel.use((state) => state.protagonist.tank);
  const antagonistTank = Duel.use((state) => state.antagonist.tank);
  const protagonistGun = Duel.use((state) => state.protagonist.gun);
  const protagonistModelDefinition =
    modelDefinitions.models[protagonistTank.id];
  const protagonistTrackModelDefinition =
    modelDefinitions.models[protagonistTank.id].tracks[protagonistTrack.id];
  const antagonistModelDefinition = modelDefinitions.models[antagonistTank.id];
  const protagonistTurretModelDefinition =
    protagonistModelDefinition.turrets[protagonistTurret.id];
  const antagonistTurretModelDefinition =
    antagonistModelDefinition.turrets[antagonistTurret.id];
  const protagonistGunModelDefinition =
    protagonistTurretModelDefinition.guns[
      protagonistGun.gun_type!.value.base.id
    ];
  const protagonistHullOrigin = new Vector3(
    protagonistTrackModelDefinition.origin.x,
    protagonistTrackModelDefinition.origin.y,
    -protagonistTrackModelDefinition.origin.z,
  );
  const protagonistTurretOrigin = new Vector3(
    protagonistModelDefinition.turret_origin.x,
    protagonistModelDefinition.turret_origin.y,
    -protagonistModelDefinition.turret_origin.z,
  );
  const protagonistGunOrigin = new Vector3(
    protagonistTurretModelDefinition.gun_origin.x,
    protagonistTurretModelDefinition.gun_origin.y,
    -protagonistTurretModelDefinition.gun_origin.z,
  );
  const antagonistGunHeight =
    protagonistTrackModelDefinition.origin.y +
    antagonistModelDefinition.turret_origin.y +
    antagonistTurretModelDefinition.gun_origin.y;
  const [autoRotate, setAutoRotate] = useState(
    display !== TankopediaDisplay.ShootingRange,
  );
  const gunHeight =
    protagonistHullOrigin.y +
    protagonistTurretOrigin.y +
    protagonistGunOrigin.y;
  const initialPosition = [-8, gunHeight + 4, -13] as const;
  const raycaster = useThree((state) => state.raycaster);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    if (!orbitControls.current) return;

    if (display === TankopediaDisplay.ShootingRange) {
      (camera as PerspectiveCamera).fov = ARCADE_MODE_FOV;
      camera.position.set(
        0,
        gunHeight + ARCADE_MODE_DISTANCE * Math.sin(ARCADE_MODE_ANGLE),
        ARCADE_MODE_DISTANCE * Math.cos(ARCADE_MODE_ANGLE),
      );
      orbitControls.current.target.set(0, gunHeight + 3, 0);
      orbitControls.current.enablePan = false;
      orbitControls.current.enableZoom = false;
    } else {
      (camera as PerspectiveCamera).fov = INSPECT_MODE_FOV;
      camera.position.set(...initialPosition);
      orbitControls.current.target.set(0, gunHeight / 2, 0);
      orbitControls.current.enablePan = true;
      orbitControls.current.enableZoom = true;
    }

    camera.updateProjectionMatrix();
  }, [
    camera,
    protagonistTrack,
    protagonistTank,
    display === TankopediaDisplay.ShootingRange,
  ]);

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
        duel.protagonist.tank.equipment_preset,
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

      invalidate();
    }

    poseEvent.on(handlePoseEvent);

    return () => {
      unsubscribeTankopediaEphemeral();
      poseEvent.off(handlePoseEvent);
    };
  }, [camera, protagonistTank.id, antagonistTank.id]);

  useEffect(() => {
    function handleDisturbance() {
      setAutoRotate(false);
    }

    poseEvent.on(handleDisturbance);
    canvas.addEventListener('pointerdown', handleDisturbance);
    const unsubscribeTankopediaPersistent = tankopediaEphemeralStore.subscribe(
      (state) => state.display,
      handleDisturbance,
    );

    return () => {
      canvas.removeEventListener('pointerdown', handleDisturbance);
      poseEvent.off(handleDisturbance);
      unsubscribeTankopediaPersistent();
    };
  }, []);

  return (
    <>
      <axesHelper ref={helper} />
      <OrbitControls
        maxDistance={20}
        minDistance={5}
        ref={orbitControls}
        enabled={tankopediaEphemeralStore.getState().controlsEnabled}
        rotateSpeed={0.25}
        enableDamping={false}
        maxPolarAngle={degToRad(100)}
        autoRotate={autoRotate}
        autoRotateSpeed={1 / 4}
        onChange={() => {
          if (display !== TankopediaDisplay.ShootingRange || !helper.current) {
            return;
          }

          raycaster.setFromCamera(emptyVector, camera);

          const intersections = raycaster.intersectObjects(
            scene.children,
            true,
          );
          const first = intersections.find(
            (intersection) => intersection.object !== helper.current,
          );

          if (first === undefined) return;

          helper.current.position.copy(first.point);
        }}
      />
    </>
  );
}
