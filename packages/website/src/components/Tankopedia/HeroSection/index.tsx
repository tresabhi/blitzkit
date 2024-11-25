import { fetchTankDefinitions, TankType } from '@blitzkit/core';
import { Box, Flex, Heading, Text } from '@radix-ui/themes';
import { times } from 'lodash-es';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { NAVBAR_HEIGHT } from '../../../constants/navbar';
import { Var } from '../../../core/radix/var';
import { useFullScreen } from '../../../hooks/useFullScreen';
import { Duel } from '../../../stores/duel';
import { TankopediaEphemeral } from '../../../stores/tankopediaEphemeral';
import type { MaybeSkeletonComponentProps } from '../../../types/maybeSkeletonComponentProps';
import type { ThicknessRange } from '../../Armor/components/StaticArmor';
import { classIcons } from '../../ClassIcon';
import { Options } from './components/Options';
import { TankSandbox } from './components/TankSandbox';
import { TankSandboxLoader } from './components/TankSandboxLoader';

const tankDefinitions = await fetchTankDefinitions();

export function HeroSection({ skeleton }: MaybeSkeletonComponentProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const isFullScreen = useFullScreen();
  const protagonist = Duel.use((state) => state.protagonist.tank);
  const Icon = classIcons[protagonist.class];
  const treeColor =
    protagonist.type === TankType.COLLECTOR
      ? 'blue'
      : protagonist.type === TankType.PREMIUM
        ? 'amber'
        : undefined;
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
    <Flex justify="center" style={{ backgroundColor: Var('color-surface') }}>
      <Flex
        direction={{ initial: 'column', md: 'row' }}
        style={{
          backgroundColor: isFullScreen
            ? Var('color-background')
            : Var('color-surface'),
          zIndex: isFullScreen ? 2 : undefined,
        }}
        height={
          isFullScreen ? '100vh' : `calc(100vh - ${NAVBAR_HEIGHT}px - 8rem)`
        }
        maxHeight={isFullScreen ? undefined : '40rem'}
        maxWidth={isFullScreen ? undefined : '120rem'}
        flexGrow="1"
        width={isFullScreen ? '100vw' : undefined}
        position={isFullScreen ? 'fixed' : 'relative'}
        top={isFullScreen ? '0' : undefined}
        left={isFullScreen ? '0' : undefined}
      >
        <Flex
          display={isFullScreen ? 'none' : 'flex'}
          style={{ userSelect: 'none' }}
          direction="column"
          align={{ initial: 'center', md: 'start' }}
          justify="center"
          pl={{ initial: '0', md: '9' }}
          pt={{ initial: '5', md: '0' }}
        >
          <Heading
            weight="bold"
            size={{ initial: '8', lg: '9' }}
            wrap="nowrap"
            color={treeColor}
          >
            <Flex align="center" gap="3">
              <Icon width="0.8em" height="0.8em" />
              {protagonist.name}
            </Flex>
          </Heading>

          <Text
            color="gray"
            size="3"
            weight="light"
            ml={{ initial: '0', md: '7', lg: '9' }}
          >
            BlitzKit Tankopedia
          </Text>
        </Flex>

        <Box
          className="tank-sandbox-container"
          flexGrow="1"
          flexBasis="0"
          flexShrink="0"
          position="relative"
        >
          <Box position="absolute" width="100%" height="100%">
            <Box width="100%" height="100%">
              {skeleton && <TankSandboxLoader id={protagonist.id} />}

              <Suspense fallback={<TankSandboxLoader id={protagonist.id} />}>
                <TankSandbox ref={canvas} thicknessRange={thicknessRange} />
              </Suspense>
            </Box>

            <Options canvas={canvas} thicknessRange={thicknessRange} />
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}
