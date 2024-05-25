import { PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, use, useEffect, useRef } from 'react';
import { Armor } from '../../../../../../components/Armor';
import { ShotDisplay } from '../../../../../../components/Armor/components/ShotDisplay';
import { applyPitchYawLimits } from '../../../../../../core/blitz/applyPitchYawLimits';
import { modelDefinitions } from '../../../../../../core/blitzkit/modelDefinitions';
import { modelTransformEvent } from '../../../../../../core/blitzkit/modelTransform';
import { Pose, poseEvent } from '../../../../../../core/blitzkit/pose';
import { useEquipment } from '../../../../../../hooks/useEquipment';
import { mutateDuel, useDuel } from '../../../../../../stores/duel';
import { mutateTankopediaTemporary } from '../../../../../../stores/tankopedia';
import { Controls } from '../Control';
import { Lighting } from '../Lighting';
import { SceneProps } from '../SceneProps';
import { ModelLoader } from './components/ModelLoader';
import { TankModel } from './components/TankModel';

export function TankSandbox() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const hasImprovedVerticalStabilizer = useEquipment(122);
  const awaitedModelDefinitions = use(modelDefinitions);
  const protagonist = useDuel((state) => state.protagonist!);
  const tankModelDefinition = awaitedModelDefinitions[protagonist.tank.id];
  const turretModelDefinition =
    tankModelDefinition.turrets[protagonist.turret.id];
  const gunModelDefinition = turretModelDefinition.guns[protagonist.gun.id];

  function handlePointerDown() {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }
  function handlePointerMove(event: PointerEvent) {
    event.preventDefault();
  }
  function handlePointerUp(event: PointerEvent) {
    event.preventDefault();

    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }

  useEffect(() => {
    function handlePoseEvent(pose: Pose) {
      switch (pose) {
        case Pose.HullDown: {
          mutateDuel((draft) => {
            const [pitch, yaw] = applyPitchYawLimits(
              -Infinity,
              0,
              gunModelDefinition.pitch,
              turretModelDefinition.yaw,
              hasImprovedVerticalStabilizer,
            );

            modelTransformEvent.emit({ pitch, yaw });
            draft.protagonist!.pitch = pitch;
            draft.protagonist!.yaw = yaw;
          });

          break;
        }

        case Pose.FaceHug: {
          mutateDuel((draft) => {
            const [pitch, yaw] = applyPitchYawLimits(
              Infinity,
              0,
              gunModelDefinition.pitch,
              turretModelDefinition.yaw,
              hasImprovedVerticalStabilizer,
            );

            modelTransformEvent.emit({ pitch, yaw });
            draft.protagonist!.pitch = pitch;
            draft.protagonist!.yaw = yaw;
          });

          break;
        }

        case Pose.Default:
          mutateDuel((draft) => {
            const [pitch, yaw] = applyPitchYawLimits(
              0,
              0,
              gunModelDefinition.pitch,
              turretModelDefinition.yaw,
              hasImprovedVerticalStabilizer,
            );

            modelTransformEvent.emit({ pitch, yaw });
            draft.protagonist!.pitch = pitch;
            draft.protagonist!.yaw = yaw;
          });

          break;
      }
    }

    poseEvent.on(handlePoseEvent);

    return () => {
      poseEvent.off(handlePoseEvent);
    };
  });

  useEffect(() => {
    mutateDuel((draft) => {
      [draft.protagonist!.pitch, draft.protagonist!.yaw] = applyPitchYawLimits(
        draft.protagonist!.pitch,
        draft.protagonist!.yaw,
        gunModelDefinition.pitch,
        turretModelDefinition.yaw,
        hasImprovedVerticalStabilizer,
      );
    });
  }, [protagonist.gun, protagonist.turret]);

  return (
    <Canvas
      gl={{
        clippingPlanes: Object.freeze([]),
        localClippingEnabled: true,
      }}
      shadows
      ref={canvas}
      onPointerDown={handlePointerDown}
      onPointerMissed={() => {
        mutateTankopediaTemporary((draft) => {
          draft.shot = undefined;
        });
      }}
      style={{
        userSelect: 'none',
      }}
    >
      <PerspectiveCamera makeDefault fov={25} far={32} />
      <Controls />
      <SceneProps />

      <Suspense fallback={<ModelLoader />}>
        <Lighting />
        <TankModel />
        <Armor />
        <ShotDisplay />
      </Suspense>
    </Canvas>
  );
}
