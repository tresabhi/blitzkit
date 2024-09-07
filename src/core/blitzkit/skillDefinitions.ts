import { TankClass } from '../../components/Tanks';
import { asset } from '@blitzkit/core/src/blitzkit/asset';
import { fetchCdonLz4 } from '@blitzkit/core/src/blitzkit/fetchCdonLz4';

export interface SkillDefinitions {
  classes: Record<TankClass, string[]>;
}

export const skillDefinitions = fetchCdonLz4<SkillDefinitions>(
  asset('definitions/skills.cdon.lz4'),
);
