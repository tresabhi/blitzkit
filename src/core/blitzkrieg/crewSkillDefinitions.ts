import { TankClass } from '../../components/Tanks';
import { asset } from './asset';
import { fetchCdonLz4 } from './fetchCdonLz4';

export interface CrewSkillDefinitions {
  classes: Record<TankClass, [string, string, string, string]>;
}

export const crewSkillDefinitions = fetchCdonLz4<CrewSkillDefinitions>(
  asset('definitions/equipment.cdon.lz4'),
);
