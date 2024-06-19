import { Flex, Grid, Heading, Separator, Text } from '@radix-ui/themes';
import { range } from 'lodash';
import { use } from 'react';
import { classIcons } from '../../../components/ClassIcon';
import { Link } from '../../../components/Link';
import PageWrapper from '../../../components/PageWrapper';
import { TANK_CLASSES } from '../../../components/Tanks/components/Item/constants';
import { asset } from '../../../core/blitzkit/asset';
import {
  NATIONS,
  Tier,
  tanksDefinitionsArray,
} from '../../../core/blitzkit/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../../../core/blitzkit/tankDefinitions/constants';
import { tankIcon } from '../../../core/blitzkit/tankIcon';
import strings from '../../../lang/en-US.json';
import { treeTypeOrder } from './components/TankSearch/constants';

export default function Page() {
  const awaitedTanksDefinitionsArray = use(tanksDefinitionsArray);
  const awaitedNations = use(NATIONS);

  return (
    <PageWrapper color="purple">
      {/* <TextField.Root size="3" placeholder="Search tanks...">
        <TextField.Slot />

        <TextField.Slot>
          <Button size="3" variant="ghost">
            M48 Patton <CaretRightIcon />
          </Button>
        </TextField.Slot>
      </TextField.Root> */}

      <Flex direction="column" gap="8" mt="4">
        {range(10, 0).map((tierUntyped) => {
          const tier = tierUntyped as Tier;
          const tierTanks = awaitedTanksDefinitionsArray.filter(
            (tank) => tank.tier === tier,
          );

          return (
            <Flex key={tier} direction="column" gap="4">
              <Heading align="center" color="gray">
                Tier {TIER_ROMAN_NUMERALS[tier]}
              </Heading>

              <Flex direction="column" gap="8">
                {awaitedNations.map((nation, nationIndex) => {
                  const nationTanks = tierTanks
                    .filter((tank) => tank.nation === nation)
                    .sort(
                      (a, b) =>
                        treeTypeOrder.indexOf(a.treeType) -
                        treeTypeOrder.indexOf(b.treeType),
                    )
                    .sort(
                      (a, b) =>
                        TANK_CLASSES.indexOf(a.class) -
                        TANK_CLASSES.indexOf(b.class),
                    );

                  if (nationTanks.length === 0) return null;

                  return (
                    <Flex direction="column" gap="4">
                      <Flex align="center">
                        <img
                          src={asset(`flags/scratched/${nation}.webp`)}
                          style={{
                            height: 64,
                            aspectRatio: '2 / 1',
                          }}
                        />

                        <Heading size="5" ml="-8" mr="4" wrap="nowrap">
                          {
                            strings.common.nations[
                              nation as keyof typeof strings.common.nations
                            ]
                          }
                        </Heading>

                        <Separator size="4" />
                      </Flex>

                      <Grid
                        flexGrow="1"
                        columns="repeat(auto-fill, minmax(80px, 1fr))"
                        gap="2"
                        gapY="4"
                        key={nation}
                      >
                        {nationTanks.map((tank) => {
                          const Icon = classIcons[tank.class];

                          return (
                            <Link
                              size="1"
                              color={
                                tank.treeType === 'collector'
                                  ? 'blue'
                                  : tank.treeType === 'premium'
                                    ? 'amber'
                                    : 'gray'
                              }
                              highContrast={tank.treeType === 'researchable'}
                              underline="hover"
                              key={tank.id}
                              href={`/tools/tankopedia/${tank.id}`}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 'var(--space-2)',
                              }}
                            >
                              <img
                                alt={tank.name}
                                src={tankIcon(tank.id)}
                                height={64}
                                style={{
                                  width: '100%',
                                  objectPosition: 'center',
                                  objectFit: 'contain',
                                }}
                              />

                              <Flex
                                justify="center"
                                gap="1"
                                align="center"
                                overflow="hidden"
                                width="100%"
                                maxWidth="100%"
                              >
                                <Icon
                                  style={{
                                    width: '1em',
                                    height: '1em',
                                    minWidth: '1em',
                                    minHeight: '1em',
                                  }}
                                />
                                <Text
                                  align="center"
                                  style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {tank.name}
                                </Text>
                              </Flex>
                            </Link>
                          );
                        })}
                      </Grid>
                    </Flex>
                  );
                })}
              </Flex>
            </Flex>
          );
        })}
      </Flex>
    </PageWrapper>
  );
}
