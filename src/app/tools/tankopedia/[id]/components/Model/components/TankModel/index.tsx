import { useLoader } from '@react-three/fiber';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Group, Vector3 } from 'three';
import { GLTFLoader } from 'three-stdlib';
import { X_AXIS } from '../../../../../../../../constants/axis';
import { asset } from '../../../../../../../../core/blitzkrieg/asset';
import {
  ModelDefinitions,
  modelDefinitions,
} from '../../../../../../../../core/blitzkrieg/modelDefinitions';
import mutateTankopedia, {
  useTankopedia,
} from '../../../../../../../../stores/tankopedia';
import { GunContainer } from './components/GunContainer';
import { HullContainer } from './components/HullContainer';
import { TurretContainer } from './components/TurretContainer';

export const TankModel = forwardRef<Group>((_props, ref) => {
  // "TypeError: dispatcher.use is not a function"
  // const awaitedModelDefinitions = use(modelDefinitions);
  const [awaitedModelDefinitions, setAwaitedModelDefinitions] = useState<
    ModelDefinitions | undefined
  >(undefined);
  const protagonist = useTankopedia((state) => {
    if (!state.areTanksAssigned) return;
    return state.protagonist;
  });

  if (!protagonist) return null;

  const modelGltf = useLoader(
    GLTFLoader,
    asset(`3d/tanks/models/${protagonist.tank.id}.glb`),
  );
  const armorGltf = useLoader(
    GLTFLoader,
    asset(`3d/tanks/armor/${protagonist.tank.id}.glb`),
  );
  const model = useTankopedia((state) => state.model);
  const hullContainer = useRef<Group>(null);
  const turretContainer = useRef<Group>(null);
  const gunContainer = useRef<Group>(null);

  useImperativeHandle(ref, () => hullContainer.current!);
  useEffect(() => {
    (async () => {
      setAwaitedModelDefinitions(await modelDefinitions);
    })();
  }, []);

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

  return (
    <HullContainer
      modelObjects={Object.values(modelGltf.nodes)}
      armorObjects={Object.values(armorGltf.nodes)}
      yaw={model.hullYaw}
      ref={hullContainer}
      onYawStart={() =>
        mutateTankopedia((draft) => {
          draft.model.controlsEnabled = false;
        })
      }
      onYawEnd={(yaw) => {
        mutateTankopedia((draft) => {
          draft.model.controlsEnabled = true;
          draft.model.hullYaw = yaw;
        });
      }}
      onTrackStart={() => {
        mutateTankopedia((draft) => {
          draft.model.controlsEnabled = false;
        });
      }}
      onTrackEnd={() => {
        mutateTankopedia((draft) => {
          draft.model.controlsEnabled = true;
        });
      }}
    >
      <TurretContainer
        armorObjects={Object.values(armorGltf.nodes)}
        initialTurretRotation={tankModelDefinition.turretRotation}
        gunOrigin={gunOrigin}
        ref={turretContainer}
        modelObjects={Object.values(modelGltf.nodes)}
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
          armorObjects={Object.values(armorGltf.nodes)}
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
          modelObjects={Object.values(modelGltf.nodes)}
          turretOrigin={turretOrigin}
        />
      </TurretContainer>
    </HullContainer>
  );
});
