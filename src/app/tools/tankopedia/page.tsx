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
import { ResearchedIcon } from '../../../components/ResearchedIcon';
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
      <Flex
        gap="8"
        direction={{
          initial: 'column',
          sm: 'row',
        }}
        pt={{
          initial: '0',
          sm: '6',
        }}
      >
        <Flex
          direction={{
            initial: 'row',
            sm: 'column',
          }}
          gap="4"
          align="start"
          pt={{
            initial: '0',
            sm: '8',
          }}
        >
          <Flex
            direction={{
              initial: 'row',
              sm: 'column',
            }}
            overflow="hidden"
            style={{
              borderRadius: 'var(--radius-4)',
            }}
          >
            <Flex
              direction={{
                sm: 'row',
                initial: 'column',
              }}
            >
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
            <Flex
              direction={{
                sm: 'row',
                initial: 'column',
              }}
            >
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

          <Flex
            direction={{
              initial: 'row',
              sm: 'column',
            }}
            overflow="hidden"
            style={{
              borderRadius: 'var(--radius-4)',
            }}
          >
            <Flex
              direction={{
                sm: 'row',
                initial: 'column',
              }}
            >
              {awaitedGameDefinitions.nations
                .slice(0, Math.ceil(awaitedGameDefinitions.nations.length / 2))
                .map((nation) => (
                  <IconButton
                    // style={{ flex: 1 }}
                    variant="soft"
                    color="gray"
                    highContrast
                    radius="none"
                  >
                    <img
                      style={{ width: '1em', height: '1em' }}
                      src={asset(`flags/circle/${nation}.webp`)}
                    />
                  </IconButton>
                ))}
            </Flex>
            <Flex
              direction={{
                sm: 'row',
                initial: 'column',
              }}
            >
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

          <Flex
            overflow="hidden"
            style={{
              borderRadius: 'var(--radius-full)',
            }}
            direction={{
              sm: 'row',
              initial: 'column',
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

          <Flex
            overflow="hidden"
            style={{
              borderRadius: 'var(--radius-full)',
            }}
            direction={{
              sm: 'row',
              initial: 'column',
            }}
          >
            <IconButton variant="soft" radius="none" color="gray" highContrast>
              <ResearchedIcon style={{ width: '1em', height: '1em' }} />
            </IconButton>
            <IconButton variant="soft" radius="none" color="gray" highContrast>
              <Text
                color="amber"
                style={{ display: 'flex', justifyContent: 'center' }}
              >
                <ResearchedIcon style={{ width: '1em', height: '1em' }} />
              </Text>
            </IconButton>
            <IconButton variant="soft" radius="none" color="gray" highContrast>
              <Text
                color="blue"
                style={{ display: 'flex', justifyContent: 'center' }}
              >
                <ResearchedIcon style={{ width: '1em', height: '1em' }} />
              </Text>
            </IconButton>
          </Flex>

          <Flex direction="column" gap="2">
            <Text wrap="nowrap">Test tanks</Text>
            <RadioGroup.Root defaultValue="include">
              <RadioGroup.Item value="include">Include</RadioGroup.Item>
              <RadioGroup.Item value="exclude">Exclude</RadioGroup.Item>
              <RadioGroup.Item value="only">Only</RadioGroup.Item>
            </RadioGroup.Root>
          </Flex>
        </Flex>

        <Flex direction="column" gap="8" flexGrow="1">
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
