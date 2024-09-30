import { TankClass, TankDefinitions, TankPriceType } from '@blitzkit/core';

export async function definitions() {
  console.log('Building definitions...');

  const buffer = TankDefinitions.encode({
    tanks: {
      1: {
        name: 'asd',
        ancestors: [],
        camouflageMoving: 1,
        camouflageOnFire: 1,
        camouflages: [],
        camouflageStill: 1,
        class: TankClass.TANK_CLASS_HEAVY,
        description: 'asd',
        crew: [],
        deprecated: false,
        engines: [],
        equipmentPreset: '',
        fixedCamouflage: false,
        health: 1,
        id: 1,
        maxConsumables: 1,
        maxProvisions: 1,
        nation: 'usa',
        price: {
          type: TankPriceType.TANK_PRICE_TYPE_CREDITS,
          value: 1,
        },
        roles: {},
        speedBackwards: 1,
        speedForwards: 1,
        successors: [],
        testing: false,
        tier: 1,
        tracks: [],
        turrets: [],
        type: 1,
        xp: 1,
        nameFull: '',
        weight: 1,
      },
    },
  }).finish();

  console.log(buffer.length);

  console.log(TankDefinitions.decode(buffer));
}

definitions();
