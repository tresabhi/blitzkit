import { Box, Flex, Heading, Text } from '@radix-ui/themes';
import { Suspense, use, useEffect, useMemo, useRef, useState } from 'react';
import { ThicknessRange } from '../../../../../../components/Armor/components/StaticArmor';
import { classIcons } from '../../../../../../components/ClassIcon';
import { NAVBAR_HEIGHT } from '../../../../../../components/Navbar/index.css';
import { resolveNearPenetration } from '../../../../../../core/blitz/resolveNearPenetration';
import { tankDefinitions } from '../../../../../../core/blitzkit/tankDefinitions';
import { Var } from '../../../../../../core/blitzkit/var';
import { useFullScreen } from '../../../../../../hooks/useFullScreen';
import * as Duel from '../../../../../../stores/duel';
import { TankSandbox } from './TankSandbox';
import { TankSandboxLoader } from './TankSandboxLoader';
import { Options } from './components/Options';

interface HeroSectionProps {
  id: number;
}

export function HeroSection({ id }: HeroSectionProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const isFullScreen = useFullScreen();
  const protagonist = Duel.use((state) => state.protagonist.tank);
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
    <Flex justify="center" style={{ backgroundColor: Var('color-surface') }}>
      <Box
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
          position="absolute"
          justify={{ initial: 'center', md: 'start' }}
          width="100%"
          mt={{ initial: '6', md: '-8' }}
          top={{ initial: '0', md: '50%' }}
          left={{ initial: '-4', md: '0' }}
          pl={{ initial: '0', md: '8' }}
        >
          <Flex direction="column" align={{ initial: 'center', md: 'start' }}>
            <Heading
              weight="bold"
              size={{ initial: '8', xl: '9' }}
              wrap="nowrap"
              color={treeColor}
            >
              <Flex align="center" gap="3">
                <Icon width="0.8em" height="0.8em" />
                {tank.name}
              </Flex>
            </Heading>

            <Text
              color="gray"
              size="3"
              weight="light"
              ml={{ initial: '0', md: '7', xl: '9' }}
            >
              BlitzKit Tankopedia
            </Text>
          </Flex>
        </Flex>

        <Box
          position="absolute"
          width="100%"
          height="100%"
          className="tank-sandbox-container"
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
      </Box>
    </Flex>
  );
}
