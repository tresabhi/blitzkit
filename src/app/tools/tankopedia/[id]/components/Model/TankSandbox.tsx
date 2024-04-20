import { LightningBoltIcon } from '@radix-ui/react-icons';
import { Button, Card, Flex, Tabs, Text, Theme } from '@radix-ui/themes';
import { PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, use, useEffect, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { Armor } from '../../../../../../components/Armor';
import { ShotDisplay } from '../../../../../../components/Armor/components/ShotDisplay';
import { applyPitchYawLimits } from '../../../../../../core/blitz/applyPitchYawLimits';
import { modelDefinitions } from '../../../../../../core/blitzrinth/modelDefinitions';
import { modelTransformEvent } from '../../../../../../core/blitzrinth/modelTransform';
import { Pose, poseEvent } from '../../../../../../core/blitzrinth/pose';
import { tankIcon } from '../../../../../../core/blitzrinth/tankIcon';
import { useEquipment } from '../../../../../../hooks/useEquipment';
import { useFullScreen } from '../../../../../../hooks/useFullScreen';
import { useWideFormat } from '../../../../../../hooks/useWideFormat';
import { BlitzrinthWide } from '../../../../../../icons/BlitzrinthWide';
import { mutateDuel, useDuel } from '../../../../../../stores/duel';
import mutateTankopediaPersistent, {
  TankopediaMode,
  mutateTankopediaTemporary,
  useTankopediaPersistent,
} from '../../../../../../stores/tankopedia';
import { AntagonistBar } from '../AntagonistBar';
import { Controls } from '../Control';
import { Lighting } from '../Lighting';
import { RotationInputs } from '../QuickInputs';
import { SceneProps } from '../SceneProps';
import { ModelLoader } from './components/ModelLoader';
import { Options } from './components/Options';
import { TankModel } from './components/TankModel';

export function TankSandbox() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const hasImprovedVerticalStabilizer = useEquipment(122);
  const awaitedModelDefinitions = use(modelDefinitions);
  const canvasWrapper = useRef<HTMLDivElement>(null);
  const mode = useTankopediaPersistent((state) => state.mode);
  const protagonist = useDuel((state) => state.protagonist!);
  const tankModelDefinition = awaitedModelDefinitions[protagonist.tank.id];
  const turretModelDefinition =
    tankModelDefinition.turrets[protagonist.turret.id];
  const gunModelDefinition = turretModelDefinition.guns[protagonist.gun.id];
  const wideFormat = useWideFormat();
  const [loadModel, setLoadModel] = useState(wideFormat || !isMobile);
  const duel = useDuel();
  const isFullScreen = useFullScreen();

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
    <Theme radius={isFullScreen ? 'none' : undefined}>
      <Card
        style={{
          position: isFullScreen ? 'fixed' : 'relative',
          border: isFullScreen ? 'none' : 'unset',
          width: isFullScreen ? '100vw' : 'unset',
          height: isFullScreen ? 'calc(100vh)' : 'unset',
          top: isFullScreen ? 0 : 'unset',
          left: isFullScreen ? 0 : 'unset',
          zIndex: isFullScreen ? 2 : 'unset',
        }}
        ref={canvasWrapper}
      >
        <Flex
          style={{
            height: isFullScreen ? '100%' : '75vh',
            maxHeight: isFullScreen ? 'unset' : 576,
          }}
          direction="column"
          gap="2"
        >
          <Tabs.Root
            value={mode}
            onValueChange={(mode) => {
              mutateTankopediaPersistent((draft) => {
                draft.mode = mode as TankopediaMode;
              });
            }}
          >
            <Tabs.List>
              <Tabs.Trigger value="model">
                <Flex gap="2" align="center">
                  Model
                </Flex>
              </Tabs.Trigger>
              <Tabs.Trigger value="armor">Armor</Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>

          {wideFormat && (
            <Text
              color="gray"
              style={{
                position: 'absolute',
                left: '50%',
                top: 16,
              }}
            >
              <BlitzrinthWide height={32} />
            </Text>
          )}

          <div
            style={{
              height: 'calc(100% - 64px)',
              position: 'absolute',
              width: '100%',
              bottom: 0,
            }}
          >
            {loadModel ? (
              <div style={{ width: '100%', height: '100%' }}>
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
              </div>
            ) : (
              <Flex
                align="center"
                justify="center"
                style={{ height: '100%', position: 'relative' }}
              >
                <Button
                  style={{
                    zIndex: 1,
                  }}
                  onClick={() => {
                    setLoadModel(true);
                  }}
                >
                  <LightningBoltIcon /> Load model
                </Button>

                <Flex
                  style={{
                    filter: 'blur(16px)',
                    width: 256,
                    height: 128,
                    display: 'flex',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transformOrigin: 'center center',
                    transform: 'translate(25%, -25%) scale(300%)',
                  }}
                >
                  <img src={tankIcon(duel.antagonist!.tank.id, 'big')} />
                </Flex>
              </Flex>
            )}
          </div>

          <Options canvasWrapper={canvasWrapper} isFullScreen={isFullScreen} />

          {isFullScreen && <AntagonistBar floating />}

          {loadModel && <RotationInputs isFullScreen={isFullScreen} />}
        </Flex>
      </Card>
    </Theme>
  );
}
