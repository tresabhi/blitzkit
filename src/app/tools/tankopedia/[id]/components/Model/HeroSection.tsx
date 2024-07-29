import { ChevronLeftIcon, MixIcon } from '@radix-ui/react-icons';
import { Box, Button, Flex, Heading, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { Suspense, use, useEffect, useMemo, useState } from 'react';
import { classIcons } from '../../../../../../components/ClassIcon';
import { ThicknessRange } from '../../../../../../components/StaticArmor/components/StaticArmorScene';
import { modelDefinitions } from '../../../../../../core/blitzkit/modelDefinitions';
import { tankDefinitions } from '../../../../../../core/blitzkit/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../../../../../../core/blitzkit/tankDefinitions/constants';
import { useFullScreen } from '../../../../../../hooks/useFullScreen';
import strings from '../../../../../../lang/en-US.json';
import * as Duel from '../../../../../../stores/duel';
import { Options } from './components/Options';
import { TankSandbox } from './TankSandbox';
import { TankSandboxLoader } from './TankSandboxLoader';

interface HeroSectionProps {
  id: number;
}

export function HeroSection({ id }: HeroSectionProps) {
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
  const awaitedModelDefinitions = use(modelDefinitions);
  const tank = awaitedTankDefinitions[id];
  const thicknessRange = useMemo(() => {
    const thicknesses = Object.values(awaitedTankDefinitions)
      .filter((thisTank) => thisTank.tier === tank.tier)
      .map((tank) => ({
        model: awaitedModelDefinitions[tank.id],
        id: tank.id,
      }))
      .filter(Boolean)
      .map(({ model, id }) => {
        const tankThicknesses = Object.values(model.armor.thickness);
        const turretThicknesses = Object.values(model.turrets)
          .map((turret) => {
            const turretThicknesses = Object.values(turret.armor.thickness);
            const gunThicknesses = Object.values(turret.guns)
              .map((gun) => Object.values(gun.armor.thickness))
              .flat();

            return [...turretThicknesses, ...gunThicknesses];
          })
          .flat();
        const totalThicknesses = [...tankThicknesses, ...turretThicknesses];

        return totalThicknesses;
      })
      .flat();

    const sortedThicknesses = thicknesses.sort((a, b) => a - b);
    const quartileIndex = (1 - 2 ** -6) * (sortedThicknesses.length + 1) - 1;
    let quartile: number;

    if (Number.isInteger(quartileIndex)) {
      quartile = sortedThicknesses[quartileIndex];
    } else {
      quartile =
        (sortedThicknesses[Math.floor(quartileIndex)] +
          sortedThicknesses[Math.ceil(quartileIndex)]) /
        2;
    }

    return { quartile } satisfies ThicknessRange;
  }, [tank.tier]);

  useEffect(() => {
    setDummyLoader(false);
  }, []);

  return (
    <Flex
      justify="center"
      pt={{ initial: '6', md: '0' }}
      style={{ background: 'var(--color-surface)', position: 'relative' }}
      height={{ initial: 'calc(75vh - 64px)', md: undefined }}
      gap="4"
    >
      <Flex
        direction={{ initial: 'column', md: 'row' }}
        style={{ maxWidth: 1600, flex: 1 }}
      >
        <Flex
          align="center"
          justify="center"
          flexGrow={{ initial: undefined, md: '1' }}
          flexBasis="0"
        >
          <Flex
            gap={{ initial: '2', md: '4' }}
            direction="column"
            ml={{ initial: '0', md: '8' }}
            align={{ initial: 'center', md: 'start' }}
            justify="center"
            style={{
              height: '100%',
            }}
          >
            <Flex gap="4">
              <Heading size={{ initial: '8', md: '9' }} color={treeColor}>
                <Icon style={{ width: '0.75em', height: '0.75em' }} />{' '}
              </Heading>
              <Heading
                size={{ initial: '8', md: '9' }}
                align={{ initial: 'center', md: 'left' }}
                color={treeColor}
              >
                {protagonist.name}
              </Heading>
            </Flex>

            <Text color="gray" ml={{ initial: '0', md: '9' }}>
              Tier {TIER_ROMAN_NUMERALS[protagonist.tier]}{' '}
              {
                (strings.common.nations_adjectives as Record<string, string>)[
                  protagonist.nation
                ]
              }{' '}
              {strings.common.tank_class_short[protagonist.class]}
            </Text>
            <Flex gap="4" ml={{ initial: '0', md: '9' }} mt="-1">
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
                <TankSandbox thicknessRange={thicknessRange} />
              </Suspense>
            </Box>

            <Options thicknessRange={thicknessRange} />
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}
