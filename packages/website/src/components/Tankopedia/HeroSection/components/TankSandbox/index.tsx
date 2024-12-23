import { BLITZKIT_TANK_ICON_SIZE } from '@blitzkit/core';
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
  naked?: boolean;
}

export const TankSandbox = forwardRef<HTMLCanvasElement, TankSandboxProps>(
  ({ thicknessRange, naked }, ref) => {
    const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();
    const canvas = useRef<HTMLCanvasElement>(null);
    const hasImprovedVerticalStabilizer = useEquipment(122);
    const protagonistGun = Duel.use((state) => state.protagonist.gun);
    const protagonistTurret = Duel.use((state) => state.protagonist.turret);
    const mutateDuel = Duel.useMutation();
    const tankModelDefinition = useTankModelDefinition();
    const turretModelDefinition =
      tankModelDefinition.turrets[protagonistTurret.id];
    const gunModelDefinition =
      turretModelDefinition.guns[protagonistGun.gun_type!.value.base.id];
    const display = TankopediaEphemeral.use((state) => state.display);
    const hideTankModelUnderArmor = TankopediaPersistent.use(
      (state) => state.hideTankModelUnderArmor,
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
    }, [protagonistGun, protagonistTurret]);

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
        frameloop={
          onScreen
            ? display === TankopediaDisplay.ShootingRange
              ? 'always'
              : 'demand'
            : 'never'
        }
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
        style={{
          userSelect: 'none',
          width: naked ? BLITZKIT_TANK_ICON_SIZE.width : '100%',
          height: naked ? BLITZKIT_TANK_ICON_SIZE.height : '100%',
          outline: naked ? '1rem red solid' : undefined,
        }}
      >
        <Controls naked={naked} />
        {!naked && <SceneProps />}
        {(display === TankopediaDisplay.Model ||
          (display === TankopediaDisplay.DynamicArmor &&
            !hideTankModelUnderArmor)) && <TankModel />}
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
