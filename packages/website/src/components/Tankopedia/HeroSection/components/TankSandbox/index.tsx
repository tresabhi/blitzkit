import { Canvas } from '@react-three/fiber';
import {
  forwardRef,
  Suspense,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { applyPitchYawLimits } from '../../../../../core/blitz/applyPitchYawLimits';
import { modelTransformEvent } from '../../../../../core/blitzkit/modelTransform';
import { Pose, poseEvent } from '../../../../../core/blitzkit/pose';
import { useEquipment } from '../../../../../hooks/useEquipment';
import { useOnScreen } from '../../../../../hooks/useOnScreen';
import { useTankModelDefinition } from '../../../../../hooks/useTankModelDefinition';
import { Duel } from '../../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../../stores/tankopediaEphemeral';
import { TankopediaPersistent } from '../../../../../stores/tankopediaPersistent';
import { TankopediaDisplay } from '../../../../../stores/tankopediaPersistent/constants';
import { Armor } from '../../../../Armor';
import { ArmorPlateDisplay } from '../../../../Armor/components/ArmorPlateDisplay';
import { ShotDisplay } from '../../../../Armor/components/ShotDisplay';
import {
  StaticArmor,
  type ThicknessRange,
} from '../../../../Armor/components/StaticArmor';
import { AutoClear } from './components/AutoClear';
import { Controls } from './components/Control';
import { Lighting } from './components/Lighting';
import { ModelLoader } from './components/ModelLoader';
import { SceneProps } from './components/SceneProps';
import { TankModel } from './components/TankModel';

interface TankSandboxProps {
  thicknessRange: ThicknessRange;
}

export const TankSandbox = forwardRef<HTMLCanvasElement, TankSandboxProps>(
  ({ thicknessRange }, ref) => {
    const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();
    const canvas = useRef<HTMLCanvasElement>(null);
    const hasImprovedVerticalStabilizer = useEquipment(122);
    const protagonist = Duel.use((state) => state.protagonist);
    const mutateDuel = Duel.useMutation();
    const tankModelDefinition = useTankModelDefinition();
    const turretModelDefinition =
      tankModelDefinition.turrets[protagonist.turret.id];
    const gunModelDefinition =
      turretModelDefinition.guns[protagonist.gun.gun_type!.value.base.id];
    const display = TankopediaPersistent.useDeferred(
      (state) => state.display,
      TankopediaDisplay.Model,
    );
    const onScreen = useOnScreen(canvas);

    useImperativeHandle(ref, () => canvas.current!, []);

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
        frameloop={onScreen ? 'demand' : 'never'}
        gl={{
          clippingPlanes: [],
          localClippingEnabled: true,
          preserveDrawingBuffer: true,
        }}
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
        <AutoClear />

        <Suspense fallback={<ModelLoader />}>
          {display === TankopediaDisplay.DynamicArmor && <Armor />}
          {display === TankopediaDisplay.StaticArmor && (
            <StaticArmor thicknessRange={thicknessRange} />
          )}
          <Lighting />
        </Suspense>
      </Canvas>
    );
  },
);
