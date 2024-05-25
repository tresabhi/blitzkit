import {
  Button,
  ChevronDownIcon,
  Flex,
  Heading,
  IconButton,
  Link,
  Text,
} from '@radix-ui/themes';
import { use } from 'react';
import { asset } from '../../../../../../../core/blitzkit/asset';
import {
  ModuleDefinition,
  ModuleType,
  TankDefinition,
  tankDefinitions,
  Tier,
  Unlock,
} from '../../../../../../../core/blitzkit/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../../../../../../../core/blitzkit/tankDefinitions/constants';
import { tankIcon } from '../../../../../../../core/blitzkit/tankIcon';
import { mutateDuel, useDuel } from '../../../../../../../stores/duel';
import { ConfigurationChildWrapper } from './ConfigurationChildWrapper';

function ModuleButton({
  tier,
  selected,
  unlock,
  top,
  onClick,
}: {
  unlock: Unlock;
  tier: Tier;
  selected: boolean;
  top: boolean;
  onClick: () => void;
}) {
  const numberFormat = Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 0,
  });
  const isTank = unlock.type === 'vehicle';
  const button = (
    <IconButton
      size="4"
      radius="small"
      variant={selected ? 'surface' : 'soft'}
      color={top ? 'amber' : selected ? undefined : 'gray'}
      onClick={onClick}
      style={{
        position: 'relative',
        width: isTank ? 72 : undefined,
        height: isTank ? 72 : undefined,
      }}
    >
      <Text
        size="1"
        color="gray"
        style={{
          position: 'absolute',
          left: isTank ? 8 : 4,
          top: isTank ? 8 : 4,
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
          gap={isTank ? '1' : undefined}
        >
          <Text size="1" color="gray">
            {numberFormat.format(unlock.cost.value)}
          </Text>

          <img
            alt={unlock.cost.type}
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
        alt={unlock.type}
        src={
          isTank
            ? tankIcon(unlock.id)
            : asset(`icons/modules/${unlock.type}.webp`)
        }
        style={{
          width: isTank ? 64 : 32,
          height: isTank ? 64 : 32,
          objectFit: 'contain',
        }}
      />
    </IconButton>
  );

  return isTank ? (
    <Link href={`/tools/tankopedia/${unlock.id}`}>{button}</Link>
  ) : (
    button
  );
}

export function Modules() {
  const awaitedTankDefinitions = use(tankDefinitions);
  const tank = useDuel((state) => state.protagonist!.tank);
  const hasUpgrades =
    tank.turrets.length > 1 ||
    tank.turrets[0].guns.length > 1 ||
    tank.engines.length > 1 ||
    tank.tracks.length > 1;
  const turret = useDuel((state) => state.protagonist!.turret);
  const gun = useDuel((state) => state.protagonist!.gun);
  const engine = useDuel((state) => state.protagonist!.engine);
  const track = useDuel((state) => state.protagonist!.track);
  const turret0 = tank.turrets[0];
  const gun0 = turret0.guns[0];
  const engine0 = tank.engines[0];
  const track0 = tank.tracks[0];
  const topTurret = tank.turrets.at(-1)!;
  const topGun = topTurret.guns.at(-1)!;
  const topEngine = tank.engines.at(-1)!;
  const topTrack = tank.tracks.at(-1)!;

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
          const first = index === 0;
          const last = index === unlocks.length - 1;
          const central = !first && !last;
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
                        width: `calc(${central ? 100 : 50}% + ${central ? 8 : 4}px)`,
                        height: 1,
                        position: 'absolute',
                        right: first ? 0 : undefined,
                        left: last ? 0 : undefined,
                        transform: `translateX(${first ? 4 : last ? -4 : 0}px)`,
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
                top={
                  unlock.type === 'turret'
                    ? module.id == topTurret.id
                    : unlock.type === 'gun'
                      ? module.id === topGun.id
                      : unlock.type === 'engine'
                        ? module.id === topEngine.id
                        : unlock.type === 'chassis'
                          ? module.id === topTrack.id
                          : false
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
    <ConfigurationChildWrapper>
      <Flex gap="4" align="center">
        <Heading size="4">Modules</Heading>
        {hasUpgrades && (
          <>
            <Button
              variant="ghost"
              color="red"
              onClick={() => {
                mutateDuel((draft) => {
                  draft.protagonist!.turret =
                    draft.protagonist!.tank.turrets[0];
                  draft.protagonist!.gun = draft.protagonist!.turret.guns[0];
                  draft.protagonist!.shell = draft.protagonist!.gun.shells[0];
                  draft.protagonist!.engine =
                    draft.protagonist!.tank.engines[0];
                  draft.protagonist!.track = draft.protagonist!.tank.tracks[0];
                });
              }}
            >
              Stock
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                mutateDuel((draft) => {
                  draft.protagonist!.turret =
                    draft.protagonist!.tank.turrets.at(-1)!;
                  draft.protagonist!.gun =
                    draft.protagonist!.turret.guns.at(-1)!;
                  draft.protagonist!.shell = draft.protagonist!.gun.shells[0];
                  draft.protagonist!.engine =
                    draft.protagonist!.tank.engines.at(-1)!;
                  draft.protagonist!.track =
                    draft.protagonist!.tank.tracks.at(-1)!;
                });
              }}
            >
              Upgrade
            </Button>
          </>
        )}
      </Flex>

      <Flex gap="2">
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
      </Flex>
    </ConfigurationChildWrapper>
  );
}
