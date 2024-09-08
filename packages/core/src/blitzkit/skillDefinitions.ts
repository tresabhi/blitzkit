import { asset, fetchCdonLz4 } from '@blitzkit/core';
import { TankClass } from './tankDefinitions';

export interface SkillDefinitions {
  classes: Record<TankClass, string[]>;
}

export const skillDefinitions = fetchCdonLz4<SkillDefinitions>(
  asset('definitions/skills.cdon.lz4'),
);
