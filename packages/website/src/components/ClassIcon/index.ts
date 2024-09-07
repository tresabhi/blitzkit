import { ComponentProps, ReactNode } from 'react';
import { TankClass } from '../Tanks';
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
