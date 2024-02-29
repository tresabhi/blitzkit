import { LightningBoltIcon } from '@radix-ui/react-icons';
import { Button, Card, Flex, Tabs, Theme } from '@radix-ui/themes';
import { PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, use, useEffect, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { Armor } from '../../../../../../components/Armor';
import { ShotDisplay } from '../../../../../../components/Armor/components/ShotDisplay';
import { applyPitchYawLimits } from '../../../../../../core/blitz/applyPitchYawLimits';
import { modelDefinitions } from '../../../../../../core/blitzkrieg/modelDefinitions';
import { modelTransformEvent } from '../../../../../../core/blitzkrieg/modelTransform';
import { Pose, poseEvent } from '../../../../../../core/blitzkrieg/pose';
import { tankIcon } from '../../../../../../core/blitzkrieg/tankIcon';
import { useWideFormat } from '../../../../../../hooks/useWideFormat';
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
  const awaitedModelDefinitions = use(modelDefinitions);
  const canvasWrapper = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const mode = useTankopediaPersistent((state) => state.mode);
  const protagonist = useDuel((state) => state.protagonist!);
  const tankModelDefinition = awaitedModelDefinitions[protagonist.tank.id];
  const turretModelDefinition =
    tankModelDefinition.turrets[protagonist.turret.id];
  const gunModelDefinition = turretModelDefinition.guns[protagonist.gun.id];
  const wideFormat = useWideFormat();
  const [loadModel, setLoadModel] = useState(wideFormat || !isMobile);
  const duel = useDuel();

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
    function handleFullScreenChange() {
      setIsFullScreen(document.fullscreenElement !== null);
    }

    function handlePoseEvent(pose: Pose) {
      switch (pose) {
        case Pose.HullDown: {
          mutateDuel((draft) => {
            const [pitch, yaw] = applyPitchYawLimits(
              -Infinity,
              0,
              gunModelDefinition.pitch,
              turretModelDefinition.yaw,
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
            );

            modelTransformEvent.emit({ pitch, yaw });
            draft.protagonist!.pitch = pitch;
            draft.protagonist!.yaw = yaw;
          });

          break;
      }
    }

    poseEvent.on(handlePoseEvent);
    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
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
      );
    });
  }, [protagonist.gun, protagonist.turret]);

  return (
    <Theme radius={isFullScreen ? 'none' : undefined}>
      <Card
        style={{
          position: 'relative',
          border: isFullScreen ? 'none' : 'unset',
        }}
        ref={canvasWrapper}
      >
        <Theme radius="full" style={{ height: '100%' }}>
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
                      {/* TODO: add rotation cube to the top right */}
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

            <Options
              canvasWrapper={canvasWrapper}
              isFullScreen={isFullScreen}
            />

            {isFullScreen && <AntagonistBar floating />}

            {loadModel && <RotationInputs isFullScreen={isFullScreen} />}
          </Flex>
        </Theme>
      </Card>
    </Theme>
  );
}
