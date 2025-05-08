import { TankType } from '@blitzkit/core';
import { Box, Flex } from '@radix-ui/themes';
import { times } from 'lodash-es';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { awaitableModelDefinitions } from '../../../core/awaitables/modelDefinitions';
import { awaitableProvisionDefinitions } from '../../../core/awaitables/provisionDefinitions';
import { awaitableTankDefinitions } from '../../../core/awaitables/tankDefinitions';
import { Var } from '../../../core/radix/var';
import { useFullScreen } from '../../../hooks/useFullScreen';
import { useLocale } from '../../../hooks/useLocale';
import { Duel } from '../../../stores/duel';
import { TankopediaEphemeral } from '../../../stores/tankopediaEphemeral';
import type { MaybeSkeletonComponentProps } from '../../../types/maybeSkeletonComponentProps';
import type { ThicknessRange } from '../../Armor/components/StaticArmor';
import { classIcons } from '../../ClassIcon';
import { Options } from './components/Options';
import { TankSandbox } from './components/TankSandbox';
import { NATION_COLORS, Title } from './components/TankSandbox/Title';

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
  const nationColors = NATION_COLORS[protagonist.nation];

  useEffect(() => {
    if (disturbed) {
      document.body.classList.remove('no-navbar');
    }
  }, [disturbed]);

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
    <Flex
      overflow="hidden"
      justify="center"
      style={{
        backgroundColor: 'black',
      }}
      position="relative"
    >
      <Box
        position="absolute"
        width="100%"
        height="100%"
        top="0"
        left="0"
        style={{
          opacity: disturbed ? 0 : 1,
          background: `linear-gradient(${nationColors.background
            .map((color) => Var(`${color}-2`))
            .join(',')})`,
          transitionDuration: '1s',
        }}
      />

      {/* <ScrollHint /> */}

      <Flex
        direction={{ initial: 'column-reverse', md: 'row' }}
        style={{
          zIndex: isFullScreen ? 2 : undefined,
          transitionDuration: '1s',
          background: isFullScreen ? 'black' : undefined,
        }}
        height={disturbed && !isFullScreen ? 'calc(100vh - 6rem)' : '100vh'}
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
              <Box
                style={{
                  width: '100%',
                  height: '100%',
                  transitionDuration: '2s',
                  opacity: revealed ? 1 : 0,
                  filter: disturbed ? undefined : `drop-shadow(0 0 2rem black)`,
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
