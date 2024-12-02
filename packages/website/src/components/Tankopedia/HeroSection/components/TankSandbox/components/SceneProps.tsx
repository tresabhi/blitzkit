import { useFrame, useLoader } from '@react-three/fiber';
import { clamp } from 'lodash-es';
import { useRef } from 'react';
import {
  ArrowHelper,
  AxesHelper,
  Group,
  MeshStandardMaterial,
  TextureLoader,
  Vector2,
  Vector3,
} from 'three';
import { awaitableModelDefinitions } from '../../../../../../core/awaitables/modelDefinitions';
import { applyPitchYawLimits } from '../../../../../../core/blitz/applyPitchYawLimits';
import { modelTransformEvent } from '../../../../../../core/blitzkit/modelTransform';
import { Duel } from '../../../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../../../stores/tankopediaEphemeral';
import { TankopediaPersistent } from '../../../../../../stores/tankopediaPersistent';
import { TankopediaDisplay } from '../../../../../../stores/tankopediaPersistent/constants';

const emptyVector = new Vector2();
const modelDefinitions = await awaitableModelDefinitions;

export function SceneProps() {
  const shellTargetHelper = useRef<AxesHelper>(null);
  const shellPathHelper = useRef<ArrowHelper>(null);
  const show = TankopediaPersistent.use(
    (state) => state.showGrid && !state.showEnvironment,
  );
  const texture = useLoader(TextureLoader, 'https://i.imgur.com/C28Z8nU.png');
  const material = useRef<MeshStandardMaterial>(null);
  const display = TankopediaEphemeral.use((state) => state.display);
  const playground = useRef<Group>(null);
  const protagonistTurret = Duel.use((state) => state.protagonist.turret);
  const protagonistTrack = Duel.use((state) => state.protagonist.track);
  const protagonistTank = Duel.use((state) => state.protagonist.tank);
  const protagonistGun = Duel.use((state) => state.protagonist.gun);
  const protagonistModelDefinition =
    modelDefinitions.models[protagonistTank.id];
  const protagonistTrackModelDefinition =
    modelDefinitions.models[protagonistTank.id].tracks[protagonistTrack.id];
  const protagonistGunModelDefinition =
    protagonistModelDefinition.turrets[protagonistTurret.id].guns[
      protagonistGun.gun_type!.value.base.id
    ];
  const protagonistTurretModelDefinition =
    protagonistModelDefinition.turrets[protagonistTurret.id];
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
  const protagonistGunOriginOnlyY = new Vector3(
    0,
    protagonistTurretModelDefinition.gun_origin.y,
    0,
  );
  const shellOrigin = new Vector3()
    .add(protagonistHullOrigin)
    .add(protagonistTurretOrigin)
    .add(protagonistGunOriginOnlyY);

  useFrame(({ camera }) => {
    if (!material.current) return;
    material.current.opacity = clamp(0.5 * camera.position.y, 0, 1);
  });

  texture.anisotropy = 2;

  useFrame(({ raycaster, camera, clock }) => {
    if (
      display !== TankopediaDisplay.ShootingRange ||
      !playground.current ||
      !shellTargetHelper.current ||
      !shellPathHelper.current
    ) {
      return;
    }

    raycaster.setFromCamera(emptyVector, camera);

    const intersections = raycaster.intersectObjects(
      playground.current.children,
      true,
    );

    if (intersections.length === 0) return;

    const target = intersections[0].point;
    const path = target.clone().sub(shellOrigin);
    const direction = path.clone().normalize();

    shellTargetHelper.current.position.copy(intersections[0].point);
    shellPathHelper.current.setDirection(direction);
    shellPathHelper.current.setLength(path.length());

    const [pitch, yaw] = applyPitchYawLimits(
      Math.asin(direction.y),
      Math.atan2(-direction.x, -direction.z),
      protagonistGunModelDefinition.pitch,
    );

    modelTransformEvent.emit({ pitch, yaw });
  });

  return (
    <>
      {show && display !== TankopediaDisplay.ShootingRange && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial ref={material} map={texture} transparent />
        </mesh>
      )}

      {display === TankopediaDisplay.ShootingRange && (
        <>
          <axesHelper ref={shellTargetHelper} />
          <arrowHelper ref={shellPathHelper} position={shellOrigin} />

          <group ref={playground}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color={0x404040} />
            </mesh>

            <mesh
              receiveShadow
              castShadow
              position={[10, 1.5, -10]}
              rotation={[0, Math.PI / 4, 0]}
            >
              <boxGeometry args={[1, 3, 1]} />
              <meshStandardMaterial color={0xff8040} />
            </mesh>

            <mesh position={shellOrigin}>
              <sphereGeometry args={[0.1, 32, 32]} />
              <meshStandardMaterial depthTest={false} />
            </mesh>
          </group>
        </>
      )}
    </>
  );
}
