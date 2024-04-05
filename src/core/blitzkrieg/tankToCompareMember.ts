import { CompareMember } from '../../stores/compare';
import { createDefaultSkills } from './createDefaultSkills';
import { SkillDefinitions } from './skillDefinitions';
import { TankDefinition } from './tankDefinitions';
import { tankToDuelMember } from './tankToDuelMember';

export function tankToCompareMember(
  tank: TankDefinition,
  skillDefinitions: SkillDefinitions,
) {
  return {
    ...tankToDuelMember(tank),
    crewSkills: createDefaultSkills(skillDefinitions),
  } satisfies CompareMember;
}
