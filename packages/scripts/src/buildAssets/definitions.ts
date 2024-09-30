import { TankDefinition, TankDefinitions } from '@blitzkit/core';

export async function definitions() {
  console.log('Building definitions...');

  const tankDefinitions = new TankDefinitions();
  const tanks = tankDefinitions.getTanksMap();

  const testTank = new TankDefinition();

  testTank.setName('asd');

  tanks.set(1, testTank);

  console.log(JSON.stringify(tankDefinitions.toObject(), null, 2));
}

definitions();
