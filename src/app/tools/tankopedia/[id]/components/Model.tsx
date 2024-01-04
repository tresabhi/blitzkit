import { useLoader } from '@react-three/fiber';
import { forwardRef, use, useImperativeHandle, useRef } from 'react';
import { Group, Vector3 } from 'three';
import { GLTFLoader } from 'three-stdlib';
import { X_AXIS } from '../../../../../constants/axis';
import { modelDefinitions } from '../../../../../core/blitzkrieg/modelDefinitions';
import mutateTankopedia, {
  useTankopedia,
} from '../../../../../stores/tankopedia';
import { GunContainer } from './GunContainer';
import { HullContainer } from './HullContainer';
import { TurretContainer } from './TurretContainer';

interface ModelProps {
  tankId: number;
  gunId: number;
  turretId: number;
}

export const Model = forwardRef<Group, ModelProps>(
  ({ gunId, tankId, turretId }, ref) => {
    const awaitedModelDefinitions = use(modelDefinitions);
    const model = useTankopedia((state) => state.model);
    const gltf = useLoader(GLTFLoader, `/test/${tankId}.glb`);
    const gunContainer = useRef<Group>(null);
    const hullContainer = useRef<Group>(null);
    const turretContainer = useRef<Group>(null);

    useImperativeHandle(ref, () => hullContainer.current!);

    const tankModelDefinition = awaitedModelDefinitions[tankId];
    const turretModelDefinition = tankModelDefinition.turrets[turretId];
    const gunModelDefinition = turretModelDefinition.guns[gunId];
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

    return (
      <HullContainer
        objects={gltf.scene.children[0].children}
        yaw={model.hullYaw}
        ref={hullContainer}
        onYawStart={() =>
          mutateTankopedia((state) => {
            state.model.controlsEnabled = false;
          })
        }
        onYawEnd={(yaw) => {
          mutateTankopedia((state) => {
            state.model.controlsEnabled = true;
            state.model.hullYaw = yaw;
          });
        }}
        onTrackStart={() => {
          mutateTankopedia((state) => {
            state.model.controlsEnabled = false;
          });
        }}
        onTrackEnd={() => {
          mutateTankopedia((state) => {
            state.model.controlsEnabled = true;
          });
        }}
      >
        <TurretContainer
          initialTurretRotation={tankModelDefinition.turretRotation}
          gunOrigin={gunOrigin}
          ref={turretContainer}
          objects={gltf.scene.children[0].children}
          model={turretModelDefinition.model}
          onYawStart={() =>
            mutateTankopedia((state) => {
              state.model.controlsEnabled = false;
            })
          }
          yawLimits={turretModelDefinition.yaw}
          pitchLimits={gunModelDefinition.pitch}
          pitch={model.gunPitch}
          onYawEnd={(pitch, yaw) => {
            mutateTankopedia((state) => {
              state.model.controlsEnabled = true;
              state.model.gunPitch = pitch;
              state.model.turretYaw = yaw;
            });
          }}
          gunContainer={gunContainer}
          turretOrigin={turretOrigin}
          yaw={model.turretYaw}
        >
          <GunContainer
            ref={gunContainer}
            initialTurretRotation={tankModelDefinition.turretRotation}
            onPitchStart={() => {
              mutateTankopedia((state) => {
                state.model.controlsEnabled = false;
              });
            }}
            pitchLimits={gunModelDefinition.pitch}
            turretContainer={turretContainer}
            yaw={model.turretYaw}
            onPitchEnd={(pitch, yaw) => {
              mutateTankopedia((state) => {
                state.model.controlsEnabled = true;
                state.model.gunPitch = pitch;
                state.model.turretYaw = yaw;
              });
            }}
            yawLimits={turretModelDefinition.yaw}
            gunOrigin={gunOrigin}
            pitch={model.gunPitch}
            model={gunModelDefinition.model}
            objects={gltf.scene.children[0].children}
            turretOrigin={turretOrigin}
          />
        </TurretContainer>
      </HullContainer>
    );
  },
);
