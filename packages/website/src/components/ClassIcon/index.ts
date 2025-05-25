import { TankClass as TankClass_dava } from '@blitzkit/core';
import { TankClass } from '@protos/blitz_static_tank_component';
import { QuestionMarkIcon } from '@radix-ui/react-icons';
import type { ComponentProps, ReactNode } from 'react';
import { ClassHeavy } from './components/ClassHeavy';
import { ClassLight } from './components/ClassLight';
import { ClassMedium } from './components/ClassMedium';
import { ClassTankDestroyer } from './components/ClassTankDestroyer';

export const classIcons_ue: Record<
  TankClass,
  ((props: ComponentProps<'svg'>) => ReactNode) | typeof QuestionMarkIcon
> = {
  [TankClass.TANK_CLASS_UNSPECIFIED]: QuestionMarkIcon,
  [TankClass.TANK_CLASS_TANK_DESTROYER]: ClassTankDestroyer,
  [TankClass.TANK_CLASS_HEAVY]: ClassHeavy,
  [TankClass.TANK_CLASS_LIGHT]: ClassLight,
  [TankClass.TANK_CLASS_MEDIUM]: ClassMedium,
};

export const classIcons: Record<
  TankClass_dava,
  (props: ComponentProps<'svg'>) => ReactNode
> = {
  [TankClass_dava.TANK_CLASS_TANK_DESTROYER]: ClassTankDestroyer,
  [TankClass_dava.TANK_CLASS_HEAVY]: ClassHeavy,
  [TankClass_dava.TANK_CLASS_LIGHT]: ClassLight,
  [TankClass_dava.TANK_CLASS_MEDIUM]: ClassMedium,
};
