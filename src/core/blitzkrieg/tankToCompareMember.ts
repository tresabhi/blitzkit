import { uniqueId } from 'lodash';
import { CompareMember } from '../../stores/compare';
import { createDefaultSkills } from './createDefaultSkills';
import { ProvisionDefinitions } from './provisionDefinitions';
import { SkillDefinitions } from './skillDefinitions';
import { TankDefinition } from './tankDefinitions';
import { tankToDuelMember } from './tankToDuelMember';

export function tankToCompareMember(
  tank: TankDefinition,
  provisionDefinitions: ProvisionDefinitions,
  skillDefinitions: SkillDefinitions,
) {
  return {
    ...tankToDuelMember(tank, provisionDefinitions),

    crewSkills: createDefaultSkills(skillDefinitions),
    key: uniqueId(),
  } satisfies CompareMember;
}
