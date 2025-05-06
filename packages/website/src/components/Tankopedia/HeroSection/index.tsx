import { TankType } from '@blitzkit/core';
import { Box, Flex } from '@radix-ui/themes';
import { times } from 'lodash-es';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { NAVBAR_HEIGHT } from '../../../constants/navbar';
import { awaitableModelDefinitions } from '../../../core/awaitables/modelDefinitions';
import { awaitableProvisionDefinitions } from '../../../core/awaitables/provisionDefinitions';
import { awaitableTankDefinitions } from '../../../core/awaitables/tankDefinitions';
import { useFullScreen } from '../../../hooks/useFullScreen';
import { useLocale } from '../../../hooks/useLocale';
import { Duel } from '../../../stores/duel';
import { TankopediaEphemeral } from '../../../stores/tankopediaEphemeral';
import type { MaybeSkeletonComponentProps } from '../../../types/maybeSkeletonComponentProps';
import type { ThicknessRange } from '../../Armor/components/StaticArmor';
import { classIcons } from '../../ClassIcon';
import { Options } from './components/Options';
import { TankSandbox } from './components/TankSandbox';
import { Title } from './components/TankSandbox/Title';

const [provisionDefinitions, modelDefinitions, tankDefinitions] =
  await Promise.all([
    awaitableProvisionDefinitions,
    awaitableModelDefinitions,
    awaitableTankDefinitions,
  ]);

export function HeroSection({ skeleton }: MaybeSkeletonComponentProps) {
  const [showSwapDialog, setShowSwapDialog] = useState(false);
  const revealed = TankopediaEphemeral.use((state) => state.revealed);
  const disturbed = TankopediaEphemeral.use((state) => state.disturbed);
  const { unwrap, strings } = useLocale();
  const canvas = useRef<HTMLCanvasElement>(null);
  const isFullScreen = useFullScreen();
  const protagonist = Duel.use((state) => state.protagonist.tank);
  const antagonist = Duel.use((state) => state.antagonist.tank);
  const Icon = classIcons[protagonist.class];
  const treeColor =
    protagonist.type === TankType.COLLECTOR
      ? 'blue'
      : protagonist.type === TankType.PREMIUM
        ? 'amber'
        : undefined;
  const compareTanks =
    protagonist.id === antagonist.id
      ? [protagonist.id]
      : [protagonist.id, antagonist.id];
  const thicknessRange = useMemo(() => {
    const entries = Object.values(tankDefinitions.tanks);
    const filtered = entries.filter(
      (thisTank) => thisTank.tier === protagonist.tier,
    );
    const value =
      (filtered.reduce((accumulator, thisTank) => {
        return (
          accumulator +
          thisTank.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.shells[0]
            .penetration.near
        );
      }, 0) /
        filtered.length) *
      (3 / 4);

    return { value } satisfies ThicknessRange;
  }, [protagonist]);
  const duelStore = Duel.useStore();
  const mutateDuel = Duel.useMutation();
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const { shells } =
        duelStore.getState().antagonist.gun.gun_type!.value.base;

      times(3, (index) => {
        if (event.key === `${index + 1}` && shells.length > index) {
          mutateDuel((draft) => {
            draft.antagonist.shell = shells[index];
          });
          mutateTankopediaEphemeral((draft) => {
            draft.customShell = undefined;
          });
        }
      });
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Flex justify="center">
      <Flex
        direction={{ initial: 'column-reverse', md: 'row' }}
        style={{
          zIndex: isFullScreen ? 2 : undefined,
          backgroundColor: 'black',
        }}
        height={
          isFullScreen ? '100vh' : `calc(100vh - ${NAVBAR_HEIGHT}px - 8rem)`
        }
        maxHeight={isFullScreen ? undefined : '60rem'}
        maxWidth={isFullScreen ? undefined : '120rem'}
        flexGrow="1"
        width={isFullScreen ? '100vw' : undefined}
        position={isFullScreen ? 'fixed' : 'relative'}
        top={isFullScreen ? '0' : undefined}
        left={isFullScreen ? '0' : undefined}
      >
        <Title />

        <Box
          className="tank-sandbox-container"
          flexGrow="1"
          flexBasis="0"
          flexShrink="0"
          position="relative"
        >
          <Box position="absolute" width="100%" height="100%" overflow="hidden">
            <Box
              width="100%"
              height="100%"
              position="relative"
              style={{
                transitionDuration: '1s',
              }}
            >
              {/* {!revealed && (
                <Spinner
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: Var('space-6'),
                    height: Var('space-6'),
                  }}
                />
              )} */}

              {/* {skeleton && <TankSandboxLoader id={protagonist.id} />} */}

              <Box
                style={{
                  width: '100%',
                  height: '100%',
                  transitionDuration: '2s',
                  opacity: revealed ? 1 : 0,
                }}
              >
                <Suspense>
                  <TankSandbox ref={canvas} thicknessRange={thicknessRange} />
                </Suspense>
              </Box>
            </Box>

            <Options
              skeleton={skeleton}
              canvas={canvas}
              thicknessRange={thicknessRange}
            />
          </Box>
        </Box>

        <Title outline />
      </Flex>
    </Flex>
  );
}
