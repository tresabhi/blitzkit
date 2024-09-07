import { asset } from '@blitzkit/core/src/blitzkit/asset';
import { fetchCdonLz4 } from '@blitzkit/core/src/blitzkit/fetchCdonLz4';
import { TankClass } from '../../../../src/components/Tanks';

export interface SkillDefinitions {
  classes: Record<TankClass, string[]>;
}

export const skillDefinitions = fetchCdonLz4<SkillDefinitions>(
  asset('definitions/skills.cdon.lz4'),
);
