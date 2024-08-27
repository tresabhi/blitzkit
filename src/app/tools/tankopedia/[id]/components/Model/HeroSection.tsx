import { ChevronLeftIcon, MixIcon } from '@radix-ui/react-icons';
import { Box, Button, Flex, Heading } from '@radix-ui/themes';
import Link from 'next/link';
import { Suspense, use, useEffect, useMemo, useRef, useState } from 'react';
import { classIcons } from '../../../../../../components/ClassIcon';
import { ThicknessRange } from '../../../../../../components/StaticArmor';
import { resolveNearPenetration } from '../../../../../../core/blitz/resolveNearPenetration';
import { tankDefinitions } from '../../../../../../core/blitzkit/tankDefinitions';
import { useFullScreen } from '../../../../../../hooks/useFullScreen';
import * as App from '../../../../../../stores/app';
import * as Duel from '../../../../../../stores/duel';
import { Options } from './components/Options';
import { MetaSection } from './MetaSection';
import { TankSandbox } from './TankSandbox';
import { TankSandboxLoader } from './TankSandboxLoader';

interface HeroSectionProps {
  id: number;
}

export function HeroSection({ id }: HeroSectionProps) {
  const developerMode = App.useDeferred(false, (state) => state.developerMode);
  const canvas = useRef<HTMLCanvasElement>(null);
  const protagonist = Duel.use((state) => state.protagonist.tank);
  const antagonist = Duel.use((state) => state.antagonist.tank);
  const compareTanks =
    protagonist.id === antagonist.id
      ? [protagonist.id]
      : [protagonist.id, antagonist.id];
  const isFullScreen = useFullScreen();
  const Icon = classIcons[protagonist.class];
  const [dummyLoader, setDummyLoader] = useState(true);
  const treeColor =
    protagonist.treeType === 'collector'
      ? 'blue'
      : protagonist.treeType === 'premium'
        ? 'amber'
        : undefined;
  const awaitedTankDefinitions = use(tankDefinitions);
  const tank = awaitedTankDefinitions[id];
  const ClassIcon = classIcons[tank.class];
  const thicknessRange = useMemo(() => {
    const entries = Object.values(awaitedTankDefinitions);
    const filtered = entries.filter((thisTank) => thisTank.tier === tank.tier);
    const value =
      (filtered.reduce((accumulator, thisTank) => {
        return (
          accumulator +
          resolveNearPenetration(
            thisTank.turrets.at(-1)!.guns.at(-1)!.shells[0].penetration,
          )
        );
      }, 0) /
        filtered.length) *
      (3 / 4);

    return { value } satisfies ThicknessRange;
  }, [tank.tier]);

  useEffect(() => {
    setDummyLoader(false);
  }, []);

  return (
    <Flex
      justify="center"
      pt={{ initial: '6', md: '0' }}
      style={{ background: 'var(--color-surface)', position: 'relative' }}
      height={{ initial: 'calc(75vh - 4rem)', md: undefined }}
      minHeight={{ initial: '30rem' }}
      gap="4"
    >
      <Flex
        direction={{ initial: 'column', md: 'row' }}
        style={{ maxWidth: '140rem', flex: 1 }}
        gap={{ initial: '0', md: '6' }}
      >
        <Flex
          align="center"
          justify="center"
          flexGrow={{ initial: undefined, md: '1' }}
          flexBasis="0"
        >
          <Flex
            gap="2"
            direction="column"
            ml={{ initial: '0', md: '8' }}
            align={{ initial: 'center', md: 'start' }}
            justify="center"
            style={{ height: '100%', userSelect: 'none' }}
          >
            <Flex gap="4">
              <Link href="/tools/tankopedia">
                <Button variant="ghost" size="1" ml="-1">
                  <ChevronLeftIcon />
                  Back
                </Button>
              </Link>

              <Link href={`/tools/compare?tanks=${compareTanks.join('%2C')}`}>
                <Button variant="ghost" size="1">
                  <MixIcon />
                  Compare
                </Button>
              </Link>
            </Flex>

            <Flex gap="4">
              <Heading size={{ initial: '8', sm: '9' }} color={treeColor}>
                <Icon style={{ width: '0.75em', height: '0.75em' }} />{' '}
              </Heading>

              <Heading
                size={{ initial: '8', sm: '9' }}
                align={{ initial: 'center', md: 'left' }}
                color={treeColor}
              >
                {protagonist.name}
              </Heading>
            </Flex>

            <MetaSection naked />
          </Flex>
        </Flex>

        <Box
          className="tank-sandbox-container"
          height={{ initial: undefined, md: '512px' }}
          style={{
            flex: 2,
            position: isFullScreen ? 'fixed' : 'relative',
            top: isFullScreen ? 0 : undefined,
            left: isFullScreen ? 0 : undefined,
            width: isFullScreen ? '100vw' : undefined,
            height: isFullScreen ? '100vh' : 'auto',
            zIndex: isFullScreen ? 3 : undefined,
            background: isFullScreen ? 'var(--color-background)' : undefined,
          }}
        >
          <Box width="100%" height="100%" position="absolute">
            <Box width="100%" height="100%">
              <TankSandboxLoader
                id={id}
                display={dummyLoader ? 'flex' : 'none'}
              />

              <Suspense
                fallback={
                  <TankSandboxLoader
                    id={id}
                    display={dummyLoader ? 'none' : 'flex'}
                  />
                }
              >
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
