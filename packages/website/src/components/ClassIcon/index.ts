import { TankClass } from '@blitzkit/core';
import { ComponentProps, ReactNode } from 'react';
import { ClassHeavy } from './components/ClassHeavy';
import { ClassLight } from './components/ClassLight';
import { ClassMedium } from './components/ClassMedium';
import { ClassTankDestroyer } from './components/ClassTankDestroyer';

export const classIcons: Record<
  TankClass,
  (props: ComponentProps<'svg'>) => ReactNode
> = {
  'AT-SPG': ClassTankDestroyer,
  heavyTank: ClassHeavy,
  lightTank: ClassLight,
  mediumTank: ClassMedium,
};
