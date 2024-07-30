import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useRef } from 'react';
import { Armor } from '../../../../../../components/Armor';
import { ArmorPlateDisplay } from '../../../../../../components/Armor/components/ArmorPlateDisplay';
import { ShotDisplay } from '../../../../../../components/Armor/components/ShotDisplay';
import { StaticArmor } from '../../../../../../components/StaticArmor';
import { ThicknessRange } from '../../../../../../components/StaticArmor/components/StaticArmorScene';
import { applyPitchYawLimits } from '../../../../../../core/blitz/applyPitchYawLimits';
import { modelTransformEvent } from '../../../../../../core/blitzkit/modelTransform';
import { Pose, poseEvent } from '../../../../../../core/blitzkit/pose';
import { useEquipment } from '../../../../../../hooks/useEquipment';
import { useTankModelDefinition } from '../../../../../../hooks/useTankModelDefinition';
import * as Duel from '../../../../../../stores/duel';
import * as TankopediaEphemeral from '../../../../../../stores/tankopediaEphemeral';
import * as TankopediaPersistent from '../../../../../../stores/tankopediaPersistent';
import { TankopediaDisplay } from '../../../../../../stores/tankopediaPersistent/constants';
import { Controls } from '../Control';
import { Lighting } from '../Lighting';
import { SceneProps } from '../SceneProps';
import { ModelLoader } from './components/ModelLoader';
import { TankModel } from './components/TankModel';

interface TankSandboxProps {
  thicknessRange: ThicknessRange;
}

export function TankSandbox({ thicknessRange }: TankSandboxProps) {
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();
  const canvas = useRef<HTMLCanvasElement>(null);
  const hasImprovedVerticalStabilizer = useEquipment(122);
  const protagonist = Duel.use((state) => state.protagonist);
  const mutateDuel = Duel.useMutation();
  const tankModelDefinition = useTankModelDefinition();
  const turretModelDefinition =
    tankModelDefinition.turrets[protagonist.turret.id];
  const gunModelDefinition = turretModelDefinition.guns[protagonist.gun.id];
  const display = TankopediaPersistent.use((state) => state.display);

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
            draft.protagonist.pitch = pitch;
            draft.protagonist.yaw = yaw;
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
            draft.protagonist.pitch = pitch;
            draft.protagonist.yaw = yaw;
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
            draft.protagonist.pitch = pitch;
            draft.protagonist.yaw = yaw;
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
      [draft.protagonist.pitch, draft.protagonist.yaw] = applyPitchYawLimits(
        draft.protagonist.pitch,
        draft.protagonist.yaw,
        gunModelDefinition.pitch,
        turretModelDefinition.yaw,
        hasImprovedVerticalStabilizer,
      );
    });
  }, [protagonist.gun, protagonist.turret]);

  useEffect(() => {
    if (display !== TankopediaDisplay.DynamicArmor) {
      mutateTankopediaEphemeral((draft) => {
        draft.shot = undefined;
      });
    }

    if (display !== TankopediaDisplay.StaticArmor) {
      mutateTankopediaEphemeral((draft) => {
        draft.highlightArmor = undefined;
      });
    }
  }, [display]);

  return (
    <Canvas
      gl={{ clippingPlanes: Object.freeze([]), localClippingEnabled: true }}
      shadows
      ref={canvas}
      onPointerDown={handlePointerDown}
      onPointerMissed={() => {
        mutateTankopediaEphemeral((draft) => {
          draft.shot = undefined;
          draft.highlightArmor = undefined;
        });
      }}
      style={{ userSelect: 'none' }}
      camera={{ fov: 25, far: 32 }}
    >
      <Controls />
      <SceneProps />
      {display !== TankopediaDisplay.StaticArmor && <TankModel />}

      <ShotDisplay />
      <ArmorPlateDisplay />

      {/* idk why the shot display doesn't work without suspense here lol */}
      <Suspense fallback={<ModelLoader />}>
        {display === TankopediaDisplay.DynamicArmor && <Armor />}
        {display === TankopediaDisplay.StaticArmor && (
          <StaticArmor thicknessRange={thicknessRange} />
        )}
        <Lighting />
      </Suspense>
    </Canvas>
  );
}
