import { CaretRightIcon } from '@radix-ui/react-icons';
import { Button, Flex, Heading, Text, TextField } from '@radix-ui/themes';
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
import { treeTypeOrder } from './components/TankSearch/constants';

export default function Page() {
  const awaitedTanksDefinitionsArray = use(tanksDefinitionsArray);
  const awaitedNations = use(NATIONS);

  return (
    <PageWrapper color="purple">
      <TextField.Root size="3" placeholder="Search tanks...">
        <TextField.Slot />

        <TextField.Slot>
          <Button size="3" variant="ghost">
            M48 Patton <CaretRightIcon />
          </Button>
        </TextField.Slot>
      </TextField.Root>

      <Flex direction="column" gap="8" mt="4">
        {range(10, 0).map((tierUntyped) => {
          const tier = tierUntyped as Tier;
          const tierTanks = awaitedTanksDefinitionsArray.filter(
            (tank) => tank.tier === tier,
          );

          return (
            <Flex key={tier} direction="column" gap="4">
              <Heading>Tier {TIER_ROMAN_NUMERALS[tier]}</Heading>

              <Flex direction="column" gap="4">
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
                    <>
                      {nationIndex > 0 && (
                        <div
                          style={{
                            height: '0.5px',
                            background: 'var(--gray-6)',
                          }}
                        />
                      )}

                      <Flex key={nation} align="center">
                        <img
                          alt={nation}
                          src={asset(`flags/scratched/${nation}.webp`)}
                          width={128}
                          height={64}
                          style={{
                            objectFit: 'contain',
                          }}
                        />
                        <Flex wrap="wrap" gap="2">
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
                              >
                                <Flex
                                  direction="column"
                                  align="center"
                                  width="80px"
                                >
                                  <img
                                    alt={tank.name}
                                    src={tankIcon(tank.id)}
                                    width={64}
                                    height={64}
                                    style={{
                                      objectFit: 'contain',
                                    }}
                                  />

                                  <Flex
                                    justify="center"
                                    gap="1"
                                    align="center"
                                    overflow="hidden"
                                    width="100%"
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
                                </Flex>
                              </Link>
                            );
                          })}
                        </Flex>
                      </Flex>
                    </>
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
