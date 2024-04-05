import { CompareMember } from '../../stores/compare';
import { SkillDefinitions } from './skillDefinitions';
import { TankDefinition } from './tankDefinitions';
import { tankToDuelMember } from './tankToDuelMember';

export function tankToCompareMember(
  tank: TankDefinition,
  skillDefinitions: SkillDefinitions,
) {
  const member = {
    ...tankToDuelMember(tank),
    crewSkills: {},
  } as CompareMember;

  Object.values(skillDefinitions.classes).forEach((skills) => {
    skills.forEach((skill) => {
      member.crewSkills[skill] = 0;
    });
  });

  return member;
}
