import { Heading } from '@radix-ui/themes';
import { use } from 'react';
import PageWrapper from '../../../../../../components/PageWrapper';
import {
  EngineDefinition,
  GunDefinition,
  ModuleType,
  tankDefinitions,
  TrackDefinition,
  TurretDefinition,
  Unlock,
} from '../../../../../../core/blitzkit/tankDefinitions';
import { useDuel } from '../../../../../../stores/duel';

export function ModulesSection() {
  const awaitedTankDefinitions = use(tankDefinitions);
  const tank = useDuel((state) => state.protagonist!.tank);

  function tree(type: ModuleType, unlocks: Unlock[]) {
    return (
      <ul>
        {unlocks.map((unlock) => {
          let module:
            | TrackDefinition
            | EngineDefinition
            | TurretDefinition
            | GunDefinition
            | undefined = undefined;

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

          return (
            <li>
              {unlock.type} {module.name}
              {module.unlocks && tree(type, module.unlocks)}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <PageWrapper>
      <Heading>turret0</Heading>
      {tank.turrets[0].unlocks && tree('turret', tank.turrets[0].unlocks)}

      <Heading>gun0</Heading>
      {tank.turrets[0].guns[0].unlocks &&
        tree('gun', tank.turrets[0].guns[0].unlocks)}

      <Heading>engine0</Heading>
      {tank.engines[0].unlocks && tree('engine', tank.engines[0].unlocks)}

      <Heading>track0</Heading>
      {tank.tracks[0].unlocks && tree('chassis', tank.tracks[0].unlocks)}
    </PageWrapper>
  );
}
