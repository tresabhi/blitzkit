import { TankType } from '@blitzkit/core';
import { Box, Flex, Heading, Spinner, Text } from '@radix-ui/themes';
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

const tankDefinitions = await awaitableTankDefinitions;

export function HeroSection({ skeleton }: MaybeSkeletonComponentProps) {
  const revealed = TankopediaEphemeral.use((state) => state.revealed);
  const disturbed = TankopediaEphemeral.use((state) => state.disturbed);
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
    <Flex justify="center">
      <Flex
        direction={{ initial: 'column', md: 'row' }}
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
              left={disturbed ? '0' : { initial: '0', md: '12.5%' }}
              style={{ transitionDuration: '200ms' }}
            >
              {/* {skeleton && <TankSandboxLoader id={protagonist.id} />} */}

              <Suspense>
                <TankSandbox ref={canvas} thicknessRange={thicknessRange} />
              </Suspense>
            </Box>

            <Options
              skeleton={skeleton}
              canvas={canvas}
              thicknessRange={thicknessRange}
            />
          </Box>
        </Box>

        <Flex
          justify="center"
          position={{ initial: 'relative', md: 'absolute' }}
          left={{ initial: '0', md: '5', lg: '9' }}
          py="4"
          top={{ initial: '8', md: '50%' }}
          style={{
            transform: 'translate(0, -50%)',
            transitionDuration: '200ms',
          }}
          direction="column"
          align={{ initial: 'center', md: 'start' }}
          gap={disturbed ? '0' : { initial: '0', md: '2' }}
        >
          <Flex align="center" gap="3">
            <Heading
              color={treeColor}
              trim="end"
              size={
                disturbed
                  ? { initial: '6', lg: '7' }
                  : { initial: '7', lg: '8' }
              }
              style={{ transitionDuration: '200ms', position: 'relative' }}
            >
              <Icon
                width="1em"
                height="1em"
                style={{ opacity: revealed ? 1 : 0 }}
              />
              <Spinner
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '1em',
                  height: '1em',
                  opacity: revealed ? 0 : 1,
                }}
              />
            </Heading>

            <Heading
              weight="regular"
              size={
                disturbed
                  ? { initial: '7', lg: '8' }
                  : { initial: '8', lg: '9' }
              }
              style={{ transitionDuration: '200ms' }}
              wrap="nowrap"
              color={treeColor}
            >
              {unwrap(protagonist.name)}
            </Heading>
          </Flex>

          <Box
            ml="3"
            style={{
              transitionDuration: '200ms',
              opacity: revealed ? 1 : 0,
              transform: revealed ? 'translateY(0)' : 'translateY(-100%)',
            }}
          >
            <Text
              color="gray"
              size={{ initial: '3', lg: disturbed ? '4' : '5' }}
              weight="light"
              ml={{
                initial: '0',
                md: disturbed ? 'var(--font-size-6)' : 'var(--font-size-7)',
                lg: disturbed ? 'var(--font-size-7)' : 'var(--font-size-8)',
              }}
            >
              BlitzKit Tankopedia
            </Text>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
}
