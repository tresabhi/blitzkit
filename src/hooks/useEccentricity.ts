import { sumBy } from 'lodash';
import { use, useMemo } from 'react';
import {
  TankDefinition,
  tankDefinitions,
} from '../core/blitzkit/tankDefinitions';
import * as Duel from '../stores/duel';

export enum UseEccentricityMode {
  Tier,
  Class,
}

export function useEccentricity(mode: UseEccentricityMode) {
  const awaitedTankDefinitions = use(tankDefinitions);
  const tank = Duel.use((state) => state.protagonist.tank);
  const similarTanks = useMemo(
    () =>
      Object.values(awaitedTankDefinitions).filter(
        (tankB) =>
          tank.tier === tankB.tier &&
          (mode === UseEccentricityMode.Class
            ? tank.class === tankB.class
            : true),
      ),
    [tank.id],
  );

  function eccentricity(property: (tank: TankDefinition) => number) {
    const average = sumBy(similarTanks, property) / similarTanks.length;
    return property(tank) / average;
  }

  return eccentricity;
}
