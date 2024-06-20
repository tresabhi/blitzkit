import {
  Button,
  Flex,
  Grid,
  Heading,
  IconButton,
  RadioGroup,
  Separator,
  Text,
} from '@radix-ui/themes';
import { range, times } from 'lodash';
import { use } from 'react';
import { classIcons } from '../../../components/ClassIcon';
import { Link } from '../../../components/Link';
import PageWrapper from '../../../components/PageWrapper';
import { TANK_CLASSES } from '../../../components/Tanks/components/Item/constants';
import { asset } from '../../../core/blitzkit/asset';
import { gameDefinitions } from '../../../core/blitzkit/gameDefinitions';
import {
  Tier,
  tanksDefinitionsArray,
} from '../../../core/blitzkit/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../../../core/blitzkit/tankDefinitions/constants';
import { tankIcon } from '../../../core/blitzkit/tankIcon';
import { treeTypeOrder } from './components/TankSearch/constants';

export default function Page() {
  const awaitedTanksDefinitionsArray = use(tanksDefinitionsArray);
  const awaitedGameDefinitions = use(gameDefinitions);

  return (
    <PageWrapper color="purple" size={1028 + 256}>
      <Flex gap="8">
        <Flex direction="column" gap="4" align="start" pt="9">
          <Text mb="-3">Class</Text>
          <Flex
            direction="column"
            overflow="hidden"
            style={{
              borderRadius: 'var(--radius-4)',
            }}
          >
            <Flex>
              {times(5, (index) => {
                const tier = (index + 1) as Tier;

                return (
                  <Button
                    key={tier}
                    variant="soft"
                    radius="none"
                    color="gray"
                    highContrast
                    style={{
                      width: 32,
                    }}
                  >
                    {TIER_ROMAN_NUMERALS[tier]}
                  </Button>
                );
              })}
            </Flex>
            <Flex>
              {times(5, (index) => {
                const tier = (index + 6) as Tier;

                return (
                  <Button
                    key={tier}
                    variant="soft"
                    radius="none"
                    color="gray"
                    highContrast
                    style={{
                      width: 32,
                    }}
                  >
                    {TIER_ROMAN_NUMERALS[tier]}
                  </Button>
                );
              })}
            </Flex>
          </Flex>

          <Text mb="-3">Type</Text>
          <Flex
            overflow="hidden"
            style={{
              borderRadius: 'var(--radius-full)',
            }}
          >
            {TANK_CLASSES.map((tankClass) => {
              const Icon = classIcons[tankClass];

              return (
                <IconButton
                  key={tankClass}
                  variant="soft"
                  radius="none"
                  color="gray"
                  highContrast
                >
                  <Icon style={{ width: '1em', height: '1em' }} />
                </IconButton>
              );
            })}
          </Flex>

          <Text mb="-3">Nation</Text>
          <Flex
            direction="column"
            overflow="hidden"
            style={{
              borderRadius: 'var(--radius-4)',
            }}
          >
            <Flex>
              {awaitedGameDefinitions.nations
                .slice(0, Math.ceil(awaitedGameDefinitions.nations.length / 2))
                .map((nation) => (
                  <IconButton
                    style={{ flex: 1 }}
                    variant="soft"
                    color="gray"
                    highContrast
                    radius="none"
                  >
                    {/* TODO: trim icons */}
                    <img
                      style={{ width: '1em', height: '1em' }}
                      src={asset(`flags/circle/${nation}.webp`)}
                    />
                  </IconButton>
                ))}
            </Flex>
            <Flex>
              {awaitedGameDefinitions.nations
                .slice(Math.ceil(awaitedGameDefinitions.nations.length / 2))
                .map((nation) => (
                  <IconButton
                    style={{ flex: 1 }}
                    variant="soft"
                    color="gray"
                    highContrast
                    radius="none"
                  >
                    {/* TODO: trim icons */}
                    <img
                      style={{ width: '1em', height: '1em' }}
                      src={asset(`flags/circle/${nation}.webp`)}
                    />
                  </IconButton>
                ))}
            </Flex>
          </Flex>

          <Text mb="-3">Test tanks</Text>
          <RadioGroup.Root defaultValue="include">
            <RadioGroup.Item value="include">Include</RadioGroup.Item>
            <RadioGroup.Item value="exclude">Exclude</RadioGroup.Item>
            <RadioGroup.Item value="only">Only</RadioGroup.Item>
          </RadioGroup.Root>
        </Flex>

        <Flex direction="column" gap="8" mt="4" flexGrow="1">
          {range(10, 0).map((tierUntyped) => {
            const tier = tierUntyped as Tier;
            const tierTanks = awaitedTanksDefinitionsArray
              .filter((tank) => tank.tier === tier)
              .sort(
                (a, b) =>
                  treeTypeOrder.indexOf(a.treeType) -
                  treeTypeOrder.indexOf(b.treeType),
              )
              .sort(
                (a, b) =>
                  TANK_CLASSES.indexOf(a.class) - TANK_CLASSES.indexOf(b.class),
              )
              .sort(
                (a, b) =>
                  awaitedGameDefinitions.nations.indexOf(a.nation) -
                  awaitedGameDefinitions.nations.indexOf(b.nation),
              );

            return (
              <Flex key={tier} direction="column" gap="4">
                <Flex align="center" mb="4" gap="4">
                  <Heading weight="regular">
                    Tier {TIER_ROMAN_NUMERALS[tier]}
                  </Heading>
                  <Separator style={{ flex: 1 }} />
                </Flex>

                <Grid
                  flexGrow="1"
                  columns="repeat(auto-fill, minmax(100px, 1fr))"
                  gap="2"
                  gapY="6"
                >
                  {tierTanks.map((tank) => {
                    const Icon = classIcons[tank.class];

                    return (
                      <Link
                        key={tank.id}
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
                        href={`/tools/tankopedia/${tank.id}`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                          background: `url(${asset(`flags/scratched/${tank.nation}.webp`)})`,
                          backgroundSize: 'contain',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'top left',
                        }}
                      >
                        <img
                          alt={tank.name}
                          src={tankIcon(tank.id)}
                          height={64}
                          style={{
                            width: '100%',
                            objectPosition: 'center right',
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
    </PageWrapper>
  );
}
