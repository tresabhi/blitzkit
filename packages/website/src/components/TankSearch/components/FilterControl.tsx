import {
  asset,
  fetchGameDefinitions,
  TANK_CLASSES,
  TankType,
  TIER_ROMAN_NUMERALS,
  type Tier,
} from '@blitzkit/core';
import { useStore } from '@nanostores/react';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Box, Flex, IconButton, Text } from '@radix-ui/themes';
import { times } from 'lodash-es';
import { $tankFilters, initialTankFilters } from '../../../stores/tankFilters';
import { classIcons } from '../../ClassIcon';
import { ExperimentIcon } from '../../ExperimentIcon';
import { GunAutoloaderIcon } from '../../GunAutoloaderIcon';
import { GunAutoreloaderIcon } from '../../GunAutoreloaderIcon';
import { GunRegularIcon } from '../../GunRegularIcon';
import { ResearchedIcon } from '../../ResearchedIcon';
import { ScienceIcon } from '../../ScienceIcon';
import { ScienceOffIcon } from '../../ScienceOffIcon';

interface FilterControlProps {
  compact?: boolean;
}

const gameDefinitions = await fetchGameDefinitions();

export function FilterControl({ compact }: FilterControlProps) {
  const tankFilters = useStore($tankFilters);

  return (
    <Flex height="fit-content" gap="2" align="start" justify="center">
      <Flex
        direction={compact ? 'row' : { initial: 'row', md: 'column' }}
        overflow="hidden"
        style={{ borderRadius: 'var(--radius-5)' }}
      >
        <Flex direction={compact ? 'column' : { md: 'row', initial: 'column' }}>
          {times(5, (index) => {
            const tier = index as Tier;
            const selected = tankFilters.tiers?.includes(tier);

            return (
              <IconButton
                key={tier}
                variant={selected ? 'solid' : 'soft'}
                radius="none"
                color={selected ? undefined : 'gray'}
                highContrast
                onClick={() => {
                  if (tankFilters.tiers.includes(tier)) {
                    $tankFilters.setKey(
                      'tiers',
                      tankFilters.tiers.filter((t) => t !== tier),
                    );
                  } else {
                    $tankFilters.setKey('tiers', [...tankFilters.tiers, tier]);
                  }
                }}
              >
                <Text size="2">{TIER_ROMAN_NUMERALS[tier]}</Text>
              </IconButton>
            );
          })}
        </Flex>
        <Flex direction={compact ? 'column' : { md: 'row', initial: 'column' }}>
          {times(5, (index) => {
            const tier = (index + 5) as Tier;
            const selected = tankFilters.tiers?.includes(tier);

            return (
              <IconButton
                key={tier}
                variant={selected ? 'solid' : 'soft'}
                radius="none"
                color={selected ? undefined : 'gray'}
                highContrast
                onClick={() => {
                  if (tankFilters.tiers.includes(tier)) {
                    $tankFilters.setKey(
                      'tiers',
                      tankFilters.tiers.filter((t) => t !== tier),
                    );
                  } else {
                    $tankFilters.setKey('tiers', [...tankFilters.tiers, tier]);
                  }
                }}
              >
                <Text size="2">{TIER_ROMAN_NUMERALS[tier]}</Text>
              </IconButton>
            );
          })}
        </Flex>
      </Flex>

      <Flex
        direction={compact ? 'row' : { initial: 'row', md: 'column' }}
        overflow="hidden"
        style={{ borderRadius: 'var(--radius-5)' }}
      >
        <Flex direction={compact ? 'column' : { md: 'row', initial: 'column' }}>
          {gameDefinitions.nations
            .slice(0, Math.ceil(gameDefinitions.nations.length / 2))
            .map((nation) => {
              const selected = tankFilters.nations?.includes(nation);

              return (
                <IconButton
                  key={nation}
                  variant={selected ? 'solid' : 'soft'}
                  color={selected ? undefined : 'gray'}
                  highContrast
                  radius="none"
                  onClick={() => {
                    if (tankFilters.nations.includes(nation)) {
                      $tankFilters.setKey(
                        'nations',
                        tankFilters.nations.filter((n) => n !== nation),
                      );
                    } else {
                      $tankFilters.setKey('nations', [
                        ...tankFilters.nations,
                        nation,
                      ]);
                    }
                  }}
                >
                  <img
                    style={{ width: '1em', height: '1em' }}
                    src={asset(`flags/circle/${nation}.webp`)}
                  />
                </IconButton>
              );
            })}
        </Flex>
        <Flex direction={compact ? 'column' : { md: 'row', initial: 'column' }}>
          {gameDefinitions.nations
            .slice(Math.ceil(gameDefinitions.nations.length / 2))
            .map((nation) => {
              const selected = tankFilters.nations?.includes(nation);

              return (
                <IconButton
                  key={nation}
                  style={{ flex: 1 }}
                  variant={selected ? 'solid' : 'soft'}
                  color={selected ? undefined : 'gray'}
                  highContrast
                  radius="none"
                  onClick={() => {
                    if (tankFilters.nations.includes(nation)) {
                      $tankFilters.setKey(
                        'nations',
                        tankFilters.nations.filter((n) => n !== nation),
                      );
                    } else {
                      $tankFilters.setKey('nations', [
                        ...tankFilters.nations,
                        nation,
                      ]);
                    }
                  }}
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
        direction={compact ? 'column' : { md: 'row', initial: 'column' }}
      >
        {TANK_CLASSES.map((tankClass) => {
          const Icon = classIcons[tankClass];
          const selected = tankFilters.classes?.includes(tankClass);

          return (
            <IconButton
              key={tankClass}
              variant={selected ? 'solid' : 'soft'}
              radius="none"
              color={selected ? undefined : 'gray'}
              highContrast
              onClick={() => {
                if (tankFilters.classes.includes(tankClass)) {
                  $tankFilters.setKey(
                    'classes',
                    tankFilters.classes.filter((c) => c !== tankClass),
                  );
                } else {
                  $tankFilters.setKey('classes', [
                    ...tankFilters.classes,
                    tankClass,
                  ]);
                }
              }}
            >
              <Icon style={{ width: '1em', height: '1em' }} />
            </IconButton>
          );
        })}
      </Flex>

      <Flex
        overflow="hidden"
        style={{ borderRadius: 'var(--radius-full)' }}
        direction={compact ? 'column' : { md: 'row', initial: 'column' }}
      >
        <IconButton
          variant={tankFilters.gunType.includes('regular') ? 'solid' : 'soft'}
          radius="none"
          color={tankFilters.gunType.includes('regular') ? undefined : 'gray'}
          highContrast
          onClick={() => {
            if (tankFilters.gunType.includes('regular')) {
              $tankFilters.setKey(
                'gunType',
                tankFilters.gunType.filter((t) => t !== 'regular'),
              );
            } else {
              $tankFilters.setKey('gunType', [
                ...tankFilters.gunType,
                'regular',
              ]);
            }
          }}
        >
          <GunRegularIcon style={{ width: '1em', height: '1em' }} />
        </IconButton>
        <IconButton
          variant={
            tankFilters.gunType.includes('auto_loader') ? 'solid' : 'soft'
          }
          radius="none"
          color={
            tankFilters.gunType.includes('auto_loader') ? undefined : 'gray'
          }
          highContrast
          onClick={() => {
            if (tankFilters.gunType.includes('auto_loader')) {
              $tankFilters.setKey(
                'gunType',
                tankFilters.gunType.filter((t) => t !== 'auto_loader'),
              );
            } else {
              $tankFilters.setKey('gunType', [
                ...tankFilters.gunType,
                'auto_loader',
              ]);
            }
          }}
        >
          <GunAutoloaderIcon style={{ width: '1em', height: '1em' }} />
        </IconButton>
        <IconButton
          variant={
            tankFilters.gunType.includes('auto_reloader') ? 'solid' : 'soft'
          }
          radius="none"
          color={
            tankFilters.gunType.includes('auto_reloader') ? undefined : 'gray'
          }
          highContrast
          onClick={() => {
            if (tankFilters.gunType.includes('auto_reloader')) {
              $tankFilters.setKey(
                'gunType',
                tankFilters.gunType.filter((t) => t !== 'auto_reloader'),
              );
            } else {
              $tankFilters.setKey('gunType', [
                ...tankFilters.gunType,
                'auto_reloader',
              ]);
            }
          }}
        >
          <GunAutoreloaderIcon style={{ width: '1em', height: '1em' }} />
        </IconButton>
      </Flex>

      <Flex
        overflow="hidden"
        style={{ borderRadius: 'var(--radius-full)' }}
        direction={compact ? 'column' : { md: 'row', initial: 'column' }}
      >
        <IconButton
          variant={
            tankFilters.types?.includes(TankType.RESEARCHABLE)
              ? 'solid'
              : 'soft'
          }
          radius="none"
          color={
            tankFilters.types?.includes(TankType.RESEARCHABLE)
              ? undefined
              : 'gray'
          }
          highContrast
          onClick={() => {
            if (tankFilters.types.includes(TankType.RESEARCHABLE)) {
              $tankFilters.setKey(
                'types',
                tankFilters.types.filter((t) => t !== TankType.RESEARCHABLE),
              );
            } else {
              $tankFilters.setKey('types', [
                ...tankFilters.types,
                TankType.RESEARCHABLE,
              ]);
            }
          }}
        >
          <ResearchedIcon style={{ width: '1em', height: '1em' }} />
        </IconButton>
        <IconButton
          variant={
            tankFilters.types?.includes(TankType.PREMIUM) ? 'solid' : 'soft'
          }
          radius="none"
          color={
            tankFilters.types?.includes(TankType.PREMIUM) ? 'amber' : 'gray'
          }
          highContrast
          onClick={() => {
            if (tankFilters.types.includes(TankType.PREMIUM)) {
              $tankFilters.setKey(
                'types',
                tankFilters.types.filter((t) => t !== TankType.PREMIUM),
              );
            } else {
              $tankFilters.setKey('types', [
                ...tankFilters.types,
                TankType.PREMIUM,
              ]);
            }
          }}
        >
          <Text
            color={
              tankFilters.types?.includes(TankType.PREMIUM)
                ? undefined
                : 'amber'
            }
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <ResearchedIcon style={{ width: '1em', height: '1em' }} />
          </Text>
        </IconButton>
        <IconButton
          variant={
            tankFilters.types?.includes(TankType.COLLECTOR) ? 'solid' : 'soft'
          }
          radius="none"
          color={
            tankFilters.types?.includes(TankType.COLLECTOR) ? 'blue' : 'gray'
          }
          highContrast
          onClick={() => {
            if (tankFilters.types.includes(TankType.COLLECTOR)) {
              $tankFilters.setKey(
                'types',
                tankFilters.types.filter((t) => t !== TankType.COLLECTOR),
              );
            } else {
              $tankFilters.setKey('types', [
                ...tankFilters.types,
                TankType.COLLECTOR,
              ]);
            }
          }}
        >
          <Text
            color={
              tankFilters.types?.includes(TankType.COLLECTOR)
                ? undefined
                : 'blue'
            }
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <ResearchedIcon style={{ width: '1em', height: '1em' }} />
          </Text>
        </IconButton>
      </Flex>

      <Flex
        overflow="hidden"
        style={{ borderRadius: 'var(--radius-full)' }}
        direction={compact ? 'column' : { md: 'row', initial: 'column' }}
      >
        <IconButton
          variant={tankFilters.testing === 'include' ? 'solid' : 'soft'}
          radius="none"
          color={tankFilters.testing === 'include' ? undefined : 'gray'}
          highContrast
          onClick={() => {
            $tankFilters.setKey('testing', 'include');
          }}
        >
          <ExperimentIcon
            style={{ width: '1em', height: '1em', color: 'currentColor' }}
          />
        </IconButton>
        <IconButton
          variant={tankFilters.testing === 'exclude' ? 'solid' : 'soft'}
          radius="none"
          color={tankFilters.testing === 'exclude' ? undefined : 'gray'}
          highContrast
          onClick={() => {
            $tankFilters.setKey('testing', 'exclude');
          }}
        >
          <ScienceOffIcon
            style={{ width: '1em', height: '1em', color: 'currentColor' }}
          />
        </IconButton>
        <IconButton
          variant={tankFilters.testing === 'only' ? 'solid' : 'soft'}
          radius="none"
          color={tankFilters.testing === 'only' ? undefined : 'gray'}
          highContrast
          onClick={() => {
            $tankFilters.setKey('testing', 'only');
          }}
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
            $tankFilters.set(initialTankFilters);
          }}
        >
          <ReloadIcon />
        </IconButton>
      </Box>
    </Flex>
  );
}
