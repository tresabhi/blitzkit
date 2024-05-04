import { Flex, Heading } from '@radix-ui/themes';
import { use } from 'react';
import { ModuleButton } from '../../../../../../components/ModuleButtons/ModuleButton';
import PageWrapper from '../../../../../../components/PageWrapper';
import {
  ModuleDefinition,
  ModuleType,
  TankDefinition,
  tankDefinitions,
  Unlock,
} from '../../../../../../core/blitzkit/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../../../../../../core/blitzkit/tankDefinitions/constants';
import { mutateDuel, useDuel } from '../../../../../../stores/duel';
import { TreeArrow } from './TechTreeSection';

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
      <Flex direction="column" gap="2">
        {unlocks.map((unlock) => {
          let module: ModuleDefinition | TankDefinition | undefined = undefined;

          console.log(unlock.type);

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
          }

          if (module === undefined) return null;

          const unlocksFiltered = (module as ModuleDefinition).unlocks?.filter(
            ({ type }) => type !== 'vehicle',
          );

          return (
            <Flex align="center" gap="2">
              <ModuleButton
                first
                last
                module={unlock.type}
                discriminator={TIER_ROMAN_NUMERALS[module.tier]}
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

              {unlocksFiltered && unlocksFiltered.length > 0 && (
                <>
                  <TreeArrow style={{ width: 32 }} />
                  {tree(type, (module as ModuleDefinition).unlocks!)}
                </>
              )}
            </Flex>
          );
        })}
      </Flex>
    );
  }

  return (
    <PageWrapper>
      <Heading>Modules</Heading>

      <Flex direction="column" gap="2">
        <Flex align="center" gap="2">
          <ModuleButton
            module="turret"
            first
            last
            discriminator={TIER_ROMAN_NUMERALS[turret0.tier]}
            selected={turret0.id === turret.id}
            onClick={() => setByUnlock({ id: turret0.id, type: 'turret' })}
          />

          {turret0.unlocks && (
            <>
              <TreeArrow style={{ width: 32, flex: undefined }} />
              {tree('turret', turret0.unlocks)}
            </>
          )}
        </Flex>

        <Flex align="center" gap="2">
          <ModuleButton
            module="gun"
            first
            last
            discriminator={TIER_ROMAN_NUMERALS[gun0.tier]}
            selected={gun0.id === gun.id}
            onClick={() => setByUnlock({ id: gun0.id, type: 'gun' })}
          />

          {gun0.unlocks && (
            <>
              <TreeArrow style={{ width: 32, flex: undefined }} />
              {tree('gun', gun0.unlocks)}
            </>
          )}
        </Flex>

        <Flex align="center" gap="2">
          <ModuleButton
            module="engine"
            first
            last
            discriminator={TIER_ROMAN_NUMERALS[engine0.tier]}
            selected={engine0.id === engine.id}
            onClick={() => setByUnlock({ id: engine0.id, type: 'engine' })}
          />

          {engine0.unlocks && (
            <>
              <TreeArrow style={{ width: 32, flex: undefined }} />
              {tree('engine', engine0.unlocks)}
            </>
          )}
        </Flex>

        <Flex align="center" gap="2">
          <ModuleButton
            module="chassis"
            first
            last
            discriminator={TIER_ROMAN_NUMERALS[track0.tier]}
            selected={track0.id === track.id}
            onClick={() => setByUnlock({ id: track0.id, type: 'chassis' })}
          />

          {track0.unlocks && (
            <>
              <TreeArrow style={{ width: 32, flex: undefined }} />
              {tree('chassis', track0.unlocks)}
            </>
          )}
        </Flex>

        {/* <Heading>gun0</Heading>
        {tank.turrets[0].guns[0].unlocks &&
          tree('gun', tank.turrets[0].guns[0].unlocks)}

        <Heading>engine0</Heading>
        {tank.engines[0].unlocks && tree('engine', tank.engines[0].unlocks)}

        <Heading>track0</Heading>
        {tank.tracks[0].unlocks && tree('chassis', tank.tracks[0].unlocks)} */}
      </Flex>
    </PageWrapper>
  );
}
