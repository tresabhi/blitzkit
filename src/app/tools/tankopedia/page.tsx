'use client';

import { TrashIcon } from '@radix-ui/react-icons';
import { Box, Button, Flex, IconButton, Text } from '@radix-ui/themes';
import { produce } from 'immer';
import { times } from 'lodash';
import { use, useState } from 'react';
import { classIcons } from '../../../components/ClassIcon';
import { ExperimentIcon } from '../../../components/ExperimentIcon';
import PageWrapper from '../../../components/PageWrapper';
import { ResearchedIcon } from '../../../components/ResearchedIcon';
import { ScienceIcon } from '../../../components/ScienceIcon';
import { ScienceOffIcon } from '../../../components/ScienceOffIcon';
import { TankClass, TreeType } from '../../../components/Tanks';
import { TANK_CLASSES } from '../../../components/Tanks/components/Item/constants';
import { asset } from '../../../core/blitzkit/asset';
import { gameDefinitions } from '../../../core/blitzkit/gameDefinitions';
import { Tier } from '../../../core/blitzkit/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../../../core/blitzkit/tankDefinitions/constants';
import { Results } from './components/Results';

export interface TankopediaSearchPageFilters {
  tier?: Tier;
  nation?: string;
  class?: TankClass;
  type?: TreeType;
  testing: 'include' | 'exclude' | 'only';
}

const defaultTankopediaSearchPageFilters: TankopediaSearchPageFilters = {
  testing: 'include',
};

export default function Page() {
  const awaitedGameDefinitions = use(gameDefinitions);
  const [filters, setFilters] = useState<TankopediaSearchPageFilters>(
    defaultTankopediaSearchPageFilters,
  );

  function mutateFilters(recipe: (draft: TankopediaSearchPageFilters) => void) {
    setFilters(produce(recipe));
  }

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
        pb="6"
      >
        <Flex
          direction={{
            initial: 'row',
            sm: 'column',
          }}
          gap="2"
          align={{
            initial: 'start',
            sm: 'start',
          }}
          justify={{
            initial: 'center',
            sm: 'start',
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
                const selected = filters.tier === tier;

                return (
                  <IconButton
                    key={tier}
                    variant={selected ? 'solid' : 'soft'}
                    radius="none"
                    color={selected ? undefined : 'gray'}
                    highContrast
                    onClick={() =>
                      mutateFilters((draft) => {
                        draft.tier = draft.tier === tier ? undefined : tier;
                      })
                    }
                  >
                    <Text size="2">{TIER_ROMAN_NUMERALS[tier]}</Text>
                  </IconButton>
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
                const selected = filters.tier === tier;

                return (
                  <IconButton
                    key={tier}
                    variant={selected ? 'solid' : 'soft'}
                    radius="none"
                    color={selected ? undefined : 'gray'}
                    highContrast
                    onClick={() =>
                      mutateFilters((draft) => {
                        draft.tier = draft.tier === tier ? undefined : tier;
                      })
                    }
                  >
                    <Text size="2">{TIER_ROMAN_NUMERALS[tier]}</Text>
                  </IconButton>
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
                .map((nation) => {
                  const selected = filters.nation === nation;

                  return (
                    <IconButton
                      variant={selected ? 'solid' : 'soft'}
                      color={selected ? undefined : 'gray'}
                      highContrast
                      radius="none"
                      onClick={() =>
                        mutateFilters((draft) => {
                          draft.nation =
                            draft.nation === nation ? undefined : nation;
                        })
                      }
                    >
                      <img
                        style={{ width: '1em', height: '1em' }}
                        src={asset(`flags/circle/${nation}.webp`)}
                      />
                    </IconButton>
                  );
                })}
            </Flex>
            <Flex
              direction={{
                sm: 'row',
                initial: 'column',
              }}
            >
              {awaitedGameDefinitions.nations
                .slice(Math.ceil(awaitedGameDefinitions.nations.length / 2))
                .map((nation) => {
                  const selected = filters.nation === nation;

                  return (
                    <IconButton
                      style={{ flex: 1 }}
                      variant={selected ? 'solid' : 'soft'}
                      color={selected ? undefined : 'gray'}
                      highContrast
                      radius="none"
                      onClick={() =>
                        mutateFilters((draft) => {
                          draft.nation =
                            draft.nation === nation ? undefined : nation;
                        })
                      }
                    >
                      <img
                        style={{ width: '1em', height: '1em' }}
                        src={asset(`flags/circle/${nation}.webp`)}
                      />
                    </IconButton>
                  );
                })}
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
              const selected = filters.class === tankClass;

              return (
                <IconButton
                  key={tankClass}
                  variant={selected ? 'solid' : 'soft'}
                  radius="none"
                  color={selected ? undefined : 'gray'}
                  highContrast
                  onClick={() =>
                    mutateFilters((draft) => {
                      draft.class =
                        draft.class === tankClass ? undefined : tankClass;
                    })
                  }
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
            <IconButton
              variant={filters.type === 'researchable' ? 'solid' : 'soft'}
              radius="none"
              color={filters.type === 'researchable' ? undefined : 'gray'}
              highContrast
              onClick={() =>
                mutateFilters((draft) => {
                  draft.type =
                    draft.type === 'researchable' ? undefined : 'researchable';
                })
              }
            >
              <ResearchedIcon style={{ width: '1em', height: '1em' }} />
            </IconButton>
            <IconButton
              variant={filters.type === 'premium' ? 'solid' : 'soft'}
              radius="none"
              color={filters.type === 'premium' ? 'amber' : 'gray'}
              highContrast
              onClick={() =>
                mutateFilters((draft) => {
                  draft.type = draft.type === 'premium' ? undefined : 'premium';
                })
              }
            >
              <Text
                color={filters.type === 'premium' ? undefined : 'amber'}
                style={{ display: 'flex', justifyContent: 'center' }}
              >
                <ResearchedIcon style={{ width: '1em', height: '1em' }} />
              </Text>
            </IconButton>
            <IconButton
              variant={filters.type === 'collector' ? 'solid' : 'soft'}
              radius="none"
              color={filters.type === 'collector' ? 'blue' : 'gray'}
              highContrast
              onClick={() =>
                mutateFilters((draft) => {
                  draft.type =
                    draft.type === 'collector' ? undefined : 'collector';
                })
              }
            >
              <Text
                color={filters.type === 'premium' ? undefined : 'blue'}
                style={{ display: 'flex', justifyContent: 'center' }}
              >
                <ResearchedIcon style={{ width: '1em', height: '1em' }} />
              </Text>
            </IconButton>
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
            <IconButton
              variant={filters.testing === 'include' ? 'solid' : 'soft'}
              radius="none"
              color={filters.testing === 'include' ? undefined : 'gray'}
              highContrast
              onClick={() =>
                mutateFilters((draft) => {
                  draft.testing = 'include';
                })
              }
            >
              <ExperimentIcon
                style={{ width: '1em', height: '1em', color: 'currentColor' }}
              />
            </IconButton>
            <IconButton
              variant={filters.testing === 'exclude' ? 'solid' : 'soft'}
              radius="none"
              color={filters.testing === 'exclude' ? undefined : 'gray'}
              highContrast
              onClick={() =>
                mutateFilters((draft) => {
                  draft.testing = 'exclude';
                })
              }
            >
              <ScienceOffIcon
                style={{ width: '1em', height: '1em', color: 'currentColor' }}
              />
            </IconButton>
            <IconButton
              variant={filters.testing === 'only' ? 'solid' : 'soft'}
              radius="none"
              color={filters.testing === 'only' ? undefined : 'gray'}
              highContrast
              onClick={() =>
                mutateFilters((draft) => {
                  draft.testing = 'only';
                })
              }
            >
              <ScienceIcon
                style={{ width: '1em', height: '1em', color: 'currentColor' }}
              />
            </IconButton>
          </Flex>

          <Box display={{ initial: 'block', sm: 'none' }}>
            <IconButton
              color="red"
              ml="2"
              onClick={() => setFilters(defaultTankopediaSearchPageFilters)}
            >
              <TrashIcon />
            </IconButton>
          </Box>
          <Box display={{ initial: 'none', sm: 'block' }}>
            <Button
              color="red"
              mt="2"
              onClick={() => setFilters(defaultTankopediaSearchPageFilters)}
            >
              <TrashIcon /> Clear
            </Button>
          </Box>
        </Flex>

        <Results filters={filters} />
      </Flex>
    </PageWrapper>
  );
}
