import {
  ChevronDownIcon,
  Flex,
  Heading,
  IconButton,
  Text,
} from '@radix-ui/themes';
import Link from 'next/link';
import { use } from 'react';
import PageWrapper from '../../../../../../components/PageWrapper';
import { asset } from '../../../../../../core/blitzkit/asset';
import {
  ModuleDefinition,
  ModuleType,
  TankDefinition,
  tankDefinitions,
  Tier,
  Unlock,
} from '../../../../../../core/blitzkit/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../../../../../../core/blitzkit/tankDefinitions/constants';
import { tankIcon } from '../../../../../../core/blitzkit/tankIcon';
import { mutateDuel, useDuel } from '../../../../../../stores/duel';

function ModuleButton({
  tier,
  selected,
  unlock,
  onClick,
}: {
  unlock: Unlock;
  tier: Tier;
  selected: boolean;
  onClick: () => void;
}) {
  const numberFormat = Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 0,
  });
  const button = (
    <IconButton
      size="4"
      radius="small"
      variant={selected ? 'surface' : 'soft'}
      color={selected ? undefined : 'gray'}
      onClick={onClick}
      style={{
        position: 'relative',
      }}
    >
      <Text
        size="1"
        color="gray"
        style={{
          position: 'absolute',
          left: 4,
          top: 4,
        }}
      >
        {TIER_ROMAN_NUMERALS[tier]}
      </Text>

      {unlock.cost.value > 0 && (
        <Flex
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 4,
            transform: 'translateX(-50%)',
          }}
          align="center"
        >
          <Text size="1" color="gray">
            {numberFormat.format(unlock.cost.value)}
          </Text>

          <img
            src={asset(`icons/currencies/${unlock.cost.type}.webp`)}
            style={{
              width: 12,
              height: 12,
              objectFit: 'contain',
            }}
          />
        </Flex>
      )}

      <img
        src={
          unlock.type === 'vehicle'
            ? tankIcon(unlock.id)
            : asset(`icons/modules/${unlock.type}.webp`)
        }
        style={{
          width: 32,
          height: 32,
          objectFit: 'contain',
        }}
      />
    </IconButton>
  );

  return unlock.type === 'vehicle' ? (
    <Link href={`/tools/tankopedia/${unlock.id}`}>{button}</Link>
  ) : (
    button
  );
}

export function ModulesSection() {
  const awaitedTankDefinitions = use(tankDefinitions);
  const tank = useDuel((state) => state.protagonist!.tank);
  const turret = useDuel((state) => state.protagonist!.turret);
  const gun = useDuel((state) => state.protagonist!.gun);
  const engine = useDuel((state) => state.protagonist!.engine);
  const track = useDuel((state) => state.protagonist!.track);
  const turret0 = tank.turrets[0];
  const gun0 = turret0.guns[0];
  const engine0 = tank.engines[0];
  const track0 = tank.tracks[0];

  function setByUnlock(unlock: Unlock) {
    mutateDuel((draft) => {
      if (unlock.type === 'turret') {
        draft.protagonist!.turret = draft.protagonist!.tank.turrets.find(
          (turret) => turret.id === unlock.id,
        )!;

        if (
          !draft.protagonist!.turret.guns.some(
            (gun) => gun.id === draft.protagonist!.gun.id,
          )
        ) {
          draft.protagonist!.gun = draft.protagonist!.turret.guns.at(-1)!;
          draft.protagonist!.shell = draft.protagonist!.gun.shells.at(-1)!;
        }
      } else if (unlock.type === 'gun') {
        const gunInTurret = draft.protagonist!.turret.guns.find(
          (gun) => gun.id === unlock.id,
        );
        if (gunInTurret) {
          draft.protagonist!.gun = gunInTurret;
          draft.protagonist!.shell = gunInTurret.shells.at(-1)!;
        } else {
          // TODO: warn somehow?
          const suitableTurret = draft.protagonist!.tank.turrets.find(
            (turret) => turret.guns.some((gun) => gun.id === unlock.id),
          )!;
          const gunInSuitableTurret = suitableTurret.guns.find(
            (gun) => gun.id === unlock.id,
          )!;

          draft.protagonist!.turret = suitableTurret;
          draft.protagonist!.gun = gunInSuitableTurret;
          draft.protagonist!.shell = gunInSuitableTurret.shells.at(-1)!;
        }
      } else if (unlock.type === 'engine') {
        draft.protagonist!.engine = draft.protagonist!.tank.engines.find(
          (engine) => engine.id === unlock.id,
        )!;
      } else if (unlock.type === 'chassis') {
        draft.protagonist!.track = draft.protagonist!.tank.tracks.find(
          (track) => track.id === unlock.id,
        )!;
      }
    });
  }

  function tree(type: ModuleType, unlocks: Unlock[]) {
    return (
      <Flex gap="2">
        {unlocks.map((unlock, index) => {
          const direction = index < Math.floor(unlocks.length / 2) ? -1 : 1;
          let module: ModuleDefinition | TankDefinition | undefined = undefined;

          if (unlock.type === 'chassis') {
            module = tank.tracks.find((track) => track.id === unlock.id)!;
          } else if (unlock.type === 'engine') {
            module = tank.engines.find((engine) => engine.id === unlock.id)!;
          } else if (unlock.type === 'turret') {
            module = tank.turrets.find((turret) => turret.id === unlock.id)!;
          } else if (unlock.type === 'gun') {
            module = tank.turrets
              .find((turret) =>
                turret.guns.some((gun) => gun.id === unlock.id),
              )!
              .guns.find((gun) => gun.id === unlock.id)!;
          } else if (unlock.type === 'vehicle') {
            module = awaitedTankDefinitions[unlock.id];
          }

          if (module === undefined) return null;

          return (
            <Flex
              align="center"
              direction="column"
              gap="2"
              style={{
                position: 'relative',
              }}
            >
              {unlock.cost.value > 0 && (
                <>
                  {unlocks.length > 1 && (
                    <div
                      style={{
                        backgroundColor: 'currentcolor',
                        width: 'calc(50% + 4px)',
                        height: 1,
                        position: 'absolute',
                        right: direction < 0 ? 0 : undefined,
                        left: direction > 0 ? 0 : undefined,
                        transform: `translateX(${direction * -4}px)`,
                      }}
                    />
                  )}

                  <Flex
                    direction="column"
                    align="center"
                    style={{
                      marginBottom: -7,
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: 'currentcolor',
                        width: 1,
                        height: 8,
                      }}
                    />
                    <ChevronDownIcon
                      style={{
                        transform: 'translateY(-7px)',
                      }}
                    />
                  </Flex>
                </>
              )}

              <ModuleButton
                unlock={unlock}
                tier={module.tier}
                selected={
                  (unlock.type === 'turret'
                    ? turret.id
                    : unlock.type === 'gun'
                      ? gun.id
                      : unlock.type === 'engine'
                        ? engine.id
                        : unlock.type === 'chassis'
                          ? track.id
                          : -1) === unlock.id
                }
                onClick={() => setByUnlock(unlock)}
              />

              {(module as ModuleDefinition).unlocks &&
                (module as ModuleDefinition).unlocks!.length > 1 && (
                  <div
                    style={{
                      backgroundColor: 'currentcolor',
                      width: 1,
                      height: 8,
                      marginBottom: -8,
                    }}
                  />
                )}

              {(module as ModuleDefinition).unlocks &&
                tree(type, (module as ModuleDefinition).unlocks!)}
            </Flex>
          );
        })}
      </Flex>
    );
  }

  return (
    <PageWrapper>
      <Heading>Modules</Heading>

      <Flex gap="2">
        {tree('turret', [
          {
            cost: { type: 'xp', value: 0 },
            id: turret0.id,
            type: 'turret',
          },
        ])}
        {tree('gun', [
          {
            cost: { type: 'xp', value: 0 },
            id: gun0.id,
            type: 'gun',
          },
        ])}
        {tree('engine', [
          {
            cost: { type: 'xp', value: 0 },
            id: engine0.id,
            type: 'engine',
          },
        ])}
        {tree('chassis', [
          {
            cost: { type: 'xp', value: 0 },
            id: track0.id,
            type: 'chassis',
          },
        ])}
      </Flex>
    </PageWrapper>
  );
}
