'use client';

import { ReloadIcon } from '@radix-ui/react-icons';
import { Box, Flex, IconButton, Text } from '@radix-ui/themes';
import { times } from 'lodash';
import { use } from 'react';
import { classIcons } from '../../../../components/ClassIcon';
import { ExperimentIcon } from '../../../../components/ExperimentIcon';
import { ResearchedIcon } from '../../../../components/ResearchedIcon';
import { ScienceIcon } from '../../../../components/ScienceIcon';
import { ScienceOffIcon } from '../../../../components/ScienceOffIcon';
import { TANK_CLASSES } from '../../../../components/Tanks/components/Item/constants';
import { asset } from '../../../../core/blitzkit/asset';
import { gameDefinitions } from '../../../../core/blitzkit/gameDefinitions';
import { Tier } from '../../../../core/blitzkit/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../../../../core/blitzkit/tankDefinitions/constants';
import * as TankFilters from '../../../../stores/tankFilters';

interface FilterControlProps {
  compact?: boolean;
}

export function FilterControl({ compact }: FilterControlProps) {
  const awaitedGameDefinitions = use(gameDefinitions);
  const filters = TankFilters.use();
  const mutateTankFilters = TankFilters.useMutation();
  const tankFiltersStore = TankFilters.useStore();

  return (
    <Flex height="fit-content" gap="2" align="start" justify="center">
      <Flex
        direction={compact ? 'row' : { initial: 'row', sm: 'column' }}
        overflow="hidden"
        style={{ borderRadius: 'var(--radius-5)' }}
      >
        <Flex direction={compact ? 'column' : { sm: 'row', initial: 'column' }}>
          {times(5, (index) => {
            const tier = (index + 1) as Tier;
            const selected = filters.tiers?.includes(tier);

            return (
              <IconButton
                key={tier}
                variant={selected ? 'solid' : 'soft'}
                radius="none"
                color={selected ? undefined : 'gray'}
                highContrast
                onClick={() =>
                  mutateTankFilters((draft) => {
                    if (draft.tiers?.includes(tier)) {
                      draft.tiers = draft.tiers?.filter((t) => t !== tier);
                    } else {
                      draft.tiers = [...(draft.tiers ?? []), tier];
                    }
                  })
                }
              >
                <Text size="2">{TIER_ROMAN_NUMERALS[tier]}</Text>
              </IconButton>
            );
          })}
        </Flex>
        <Flex direction={compact ? 'column' : { sm: 'row', initial: 'column' }}>
          {times(5, (index) => {
            const tier = (index + 6) as Tier;
            const selected = filters.tiers?.includes(tier);

            return (
              <IconButton
                key={tier}
                variant={selected ? 'solid' : 'soft'}
                radius="none"
                color={selected ? undefined : 'gray'}
                highContrast
                onClick={() =>
                  mutateTankFilters((draft) => {
                    if (draft.tiers?.includes(tier)) {
                      draft.tiers = draft.tiers?.filter((t) => t !== tier);
                    } else {
                      draft.tiers = [...(draft.tiers ?? []), tier];
                    }
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
        direction={compact ? 'row' : { initial: 'row', sm: 'column' }}
        overflow="hidden"
        style={{ borderRadius: 'var(--radius-5)' }}
      >
        <Flex direction={compact ? 'column' : { sm: 'row', initial: 'column' }}>
          {awaitedGameDefinitions.nations
            .slice(0, Math.ceil(awaitedGameDefinitions.nations.length / 2))
            .map((nation) => {
              const selected = filters.nations?.includes(nation);

              return (
                <IconButton
                  key={nation}
                  variant={selected ? 'solid' : 'soft'}
                  color={selected ? undefined : 'gray'}
                  highContrast
                  radius="none"
                  onClick={() =>
                    mutateTankFilters((draft) => {
                      if (draft.nations?.includes(nation)) {
                        draft.nations = draft.nations?.filter(
                          (n) => n !== nation,
                        );
                      } else {
                        draft.nations = [...(draft.nations ?? []), nation];
                      }
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
        <Flex direction={compact ? 'column' : { sm: 'row', initial: 'column' }}>
          {awaitedGameDefinitions.nations
            .slice(Math.ceil(awaitedGameDefinitions.nations.length / 2))
            .map((nation) => {
              const selected = filters.nations?.includes(nation);

              return (
                <IconButton
                  key={nation}
                  style={{ flex: 1 }}
                  variant={selected ? 'solid' : 'soft'}
                  color={selected ? undefined : 'gray'}
                  highContrast
                  radius="none"
                  onClick={() =>
                    mutateTankFilters((draft) => {
                      if (draft.nations?.includes(nation)) {
                        draft.nations = draft.nations?.filter(
                          (n) => n !== nation,
                        );
                      } else {
                        draft.nations = [...(draft.nations ?? []), nation];
                      }
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
        style={{ borderRadius: 'var(--radius-full)' }}
        direction={compact ? 'column' : { sm: 'row', initial: 'column' }}
      >
        {TANK_CLASSES.map((tankClass) => {
          const Icon = classIcons[tankClass];
          const selected = filters.classes?.includes(tankClass);

          return (
            <IconButton
              key={tankClass}
              variant={selected ? 'solid' : 'soft'}
              radius="none"
              color={selected ? undefined : 'gray'}
              highContrast
              onClick={() =>
                mutateTankFilters((draft) => {
                  if (draft.classes?.includes(tankClass)) {
                    draft.classes = draft.classes?.filter(
                      (c) => c !== tankClass,
                    );
                  } else {
                    draft.classes = [...(draft.classes ?? []), tankClass];
                  }
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
        style={{ borderRadius: 'var(--radius-full)' }}
        direction={compact ? 'column' : { sm: 'row', initial: 'column' }}
      >
        <IconButton
          variant={filters.types?.includes('researchable') ? 'solid' : 'soft'}
          radius="none"
          color={filters.types?.includes('researchable') ? undefined : 'gray'}
          highContrast
          onClick={() =>
            mutateTankFilters((draft) => {
              if (draft.types?.includes('researchable')) {
                draft.types = draft.types?.filter((t) => t !== 'researchable');
              } else {
                draft.types = [...(draft.types ?? []), 'researchable'];
              }
            })
          }
        >
          <ResearchedIcon style={{ width: '1em', height: '1em' }} />
        </IconButton>
        <IconButton
          variant={filters.types?.includes('premium') ? 'solid' : 'soft'}
          radius="none"
          color={filters.types?.includes('premium') ? 'amber' : 'gray'}
          highContrast
          onClick={() =>
            mutateTankFilters((draft) => {
              if (draft.types?.includes('premium')) {
                draft.types = draft.types?.filter((t) => t !== 'premium');
              } else {
                draft.types = [...(draft.types ?? []), 'premium'];
              }
            })
          }
        >
          <Text
            color={filters.types?.includes('premium') ? undefined : 'amber'}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <ResearchedIcon style={{ width: '1em', height: '1em' }} />
          </Text>
        </IconButton>
        <IconButton
          variant={filters.types?.includes('collector') ? 'solid' : 'soft'}
          radius="none"
          color={filters.types?.includes('collector') ? 'blue' : 'gray'}
          highContrast
          onClick={() =>
            mutateTankFilters((draft) => {
              if (draft.types?.includes('collector')) {
                draft.types = draft.types?.filter((t) => t !== 'collector');
              } else {
                draft.types = [...(draft.types ?? []), 'collector'];
              }
            })
          }
        >
          <Text
            color={filters.types?.includes('collector') ? undefined : 'blue'}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <ResearchedIcon style={{ width: '1em', height: '1em' }} />
          </Text>
        </IconButton>
      </Flex>

      <Flex
        overflow="hidden"
        style={{ borderRadius: 'var(--radius-full)' }}
        direction={compact ? 'column' : { sm: 'row', initial: 'column' }}
      >
        <IconButton
          variant={filters.testing === 'include' ? 'solid' : 'soft'}
          radius="none"
          color={filters.testing === 'include' ? undefined : 'gray'}
          highContrast
          onClick={() =>
            mutateTankFilters((draft) => {
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
            mutateTankFilters((draft) => {
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
            mutateTankFilters((draft) => {
              draft.testing = 'only';
            })
          }
        >
          <ScienceIcon
            style={{ width: '1em', height: '1em', color: 'currentColor' }}
          />
        </IconButton>
      </Flex>

      <Box>
        <IconButton
          color="red"
          onClick={() => {
            tankFiltersStore.setState(tankFiltersStore.getInitialState(), true);
          }}
        >
          <ReloadIcon />
        </IconButton>
      </Box>
    </Flex>
  );
}
