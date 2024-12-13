import { OrbitControls } from '@react-three/drei';
import { invalidate, useThree } from '@react-three/fiber';
import { clamp } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';
import { PerspectiveCamera, Vector3 } from 'three';
import { OrbitControls as OrbitControlsClass } from 'three-stdlib';
import { degToRad } from 'three/src/math/MathUtils.js';
import { awaitableModelDefinitions } from '../../../../../../core/awaitables/modelDefinitions';
import { applyPitchYawLimits } from '../../../../../../core/blitz/applyPitchYawLimits';
import { hasEquipment } from '../../../../../../core/blitzkit/hasEquipment';
import { Pose, poseEvent } from '../../../../../../core/blitzkit/pose';
import { Duel } from '../../../../../../stores/duel';
import {
  SHOOTING_RANGE_ZOOM_COEFFICIENTS,
  ShootingRangeZoom,
  TankopediaEphemeral,
} from '../../../../../../stores/tankopediaEphemeral';
import { TankopediaDisplay } from '../../../../../../stores/tankopediaPersistent/constants';

const poseDistances: Record<Pose, number> = {
  [Pose.HullDown]: 15,
  [Pose.FaceHug]: 5,
  [Pose.Default]: -1,
};

const modelDefinitions = await awaitableModelDefinitions;

const ARCADE_MODE_DISTANCE = 19;
// const ARCADE_MODE_ANGLE = Math.PI / 8;
const ARCADE_MODE_ANGLE = degToRad(10);
export const ARCADE_MODE_FOV = 54;
export const INSPECT_MODE_FOV = 25;

export function Controls() {
  const shootingRangeZoom = TankopediaEphemeral.use(
    (state) => state.shootingRangeZoom,
  );
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();
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
  const protagonistGunOriginOnlyY = new Vector3(
    0,
    protagonistTurretModelDefinition.gun_origin.y,
    0,
  );
  const shellOrigin = protagonistHullOrigin
    .clone()
    .add(protagonistTurretOrigin)
    .add(protagonistGunOriginOnlyY);

  const cameraPosition = new Vector3();
  let fov: number;
  const target = new Vector3();
  let enablePan: boolean;
  let enableZoom: boolean;
  let rotationSpeed = 0.25;

  if (display === TankopediaDisplay.ShootingRange) {
    cameraPosition.set(
      0,
      gunHeight + ARCADE_MODE_DISTANCE * Math.sin(ARCADE_MODE_ANGLE),
      ARCADE_MODE_DISTANCE * Math.cos(ARCADE_MODE_ANGLE),
    );
    enablePan = false;
    enableZoom = false;

    if (shootingRangeZoom === ShootingRangeZoom.Arcade) {
      target.set(0, gunHeight + 3, 0);
      fov = ARCADE_MODE_FOV;
    } else {
      target.copy(shellOrigin);
      cameraPosition.copy(shellOrigin.add(new Vector3(0, 0, Number.EPSILON)));
      fov =
        ARCADE_MODE_FOV * SHOOTING_RANGE_ZOOM_COEFFICIENTS[shootingRangeZoom];
      rotationSpeed *= SHOOTING_RANGE_ZOOM_COEFFICIENTS[shootingRangeZoom];
    }
  } else {
    cameraPosition.set(...initialPosition);
    target.set(0, gunHeight / 2, 0);
    enablePan = true;
    enableZoom = true;
    fov = INSPECT_MODE_FOV;
  }

  camera.position.copy(cameraPosition);
  (camera as PerspectiveCamera).fov = fov;
  camera.updateProjectionMatrix();

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

    function handleKeyDown(event: KeyboardEvent) {
      if (display !== TankopediaDisplay.ShootingRange || event.repeat) return;

      if (event.key === 'Shift') {
        mutateTankopediaEphemeral((draft) => {
          draft.shootingRangeZoom =
            draft.shootingRangeZoom === ShootingRangeZoom.Arcade
              ? ShootingRangeZoom.Zoom0
              : ShootingRangeZoom.Arcade;
        });
      }
    }

    function handleWheel(event: WheelEvent) {
      if (display !== TankopediaDisplay.ShootingRange) return;

      event.preventDefault();

      mutateTankopediaEphemeral((draft) => {
        draft.shootingRangeZoom = clamp(
          draft.shootingRangeZoom - Math.sign(event.deltaY),
          ShootingRangeZoom.Arcade,
          ShootingRangeZoom.Zoom2,
        );

        console.log(draft.shootingRangeZoom);
      });
    }

    function handleScroll(event: Event) {
      if (display !== TankopediaDisplay.ShootingRange) return;

      event.preventDefault();
    }

    poseEvent.on(handleDisturbance);
    canvas.addEventListener('pointerdown', handleDisturbance);
    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('wheel', handleWheel);
    document.body.addEventListener('scroll', handleScroll);

    const unsubscribeTankopediaPersistent = tankopediaEphemeralStore.subscribe(
      (state) => state.display,
      handleDisturbance,
    );

    return () => {
      canvas.removeEventListener('pointerdown', handleDisturbance);
      poseEvent.off(handleDisturbance);
      unsubscribeTankopediaPersistent();
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('wheel', handleWheel);
      document.body.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <OrbitControls
      target={target}
      enablePan={enablePan}
      enableZoom={enableZoom}
      maxDistance={20}
      minDistance={5}
      ref={orbitControls}
      enabled={tankopediaEphemeralStore.getState().controlsEnabled}
      rotateSpeed={rotationSpeed}
      enableDamping={false}
      maxPolarAngle={degToRad(100)}
      autoRotate={autoRotate}
      autoRotateSpeed={1 / 4}
    />
  );
}
