import { TankType } from '@blitzkit/core';
import { Box, Flex, Heading, Text } from '@radix-ui/themes';
import { times } from 'lodash-es';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { NAVBAR_HEIGHT } from '../../../constants/navbar';
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
import { TankSandboxLoader } from './components/TankSandboxLoader';

const tankDefinitions = await awaitableTankDefinitions;

export function HeroSection({ skeleton }: MaybeSkeletonComponentProps) {
  const { unwrap } = useLocale();
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
    <Flex justify="center" style={{ backgroundColor: 'black' }}>
      <Flex
        direction={{ initial: 'column', md: 'row' }}
        style={{ zIndex: isFullScreen ? 2 : undefined }}
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
        <Flex
          justify="center"
          position={{ initial: 'relative', md: 'absolute' }}
          left={{ initial: '0', md: '5', lg: '9' }}
          py="4"
          top={{ initial: '8', md: '50%' }}
          style={{ transform: 'translateY(-50%)' }}
          direction="column"
          align={{ initial: 'center', md: 'start' }}
        >
          <Flex align="center" gap="3">
            <Heading
              color={treeColor}
              trim="end"
              size={{ initial: '7', lg: '6' }}
            >
              <Icon width="1em" height="1em" />
            </Heading>

            <Heading
              weight="bold"
              size={{ initial: '7', lg: '8' }}
              wrap="nowrap"
              color={treeColor}
            >
              {unwrap(protagonist.name)}
            </Heading>
          </Flex>

          <Text
            color="gray"
            size={{ initial: '3', lg: '4' }}
            weight="light"
            ml={{ initial: '0', md: '7', lg: '7' }}
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
