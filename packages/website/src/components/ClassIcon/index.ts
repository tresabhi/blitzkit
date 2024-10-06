import { TankClass } from '@blitzkit/core';
import type { ComponentProps, ReactNode } from 'react';
import { StupidCat } from '../StupidCat';
import { ClassHeavy } from './components/ClassHeavy';
import { ClassLight } from './components/ClassLight';
import { ClassMedium } from './components/ClassMedium';
import { ClassTankDestroyer } from './components/ClassTankDestroyer';

export const classIcons: Record<
  TankClass,
  (props: ComponentProps<'svg'>) => ReactNode
> = {
  [TankClass.TANK_DESTROYER]: ClassTankDestroyer,
  [TankClass.HEAVY]: ClassHeavy,
  [TankClass.LIGHT]: ClassLight,
  [TankClass.MEDIUM]: ClassMedium,
  [TankClass.UNRECOGNIZED]: StupidCat,
};
