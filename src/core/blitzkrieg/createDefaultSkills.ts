import { permanentSkills } from '../../app/tools/tankopedia/[id]/components/Characteristics/components/Skills/constants';
import { SkillDefinitions } from './skillDefinitions';

export function createDefaultSkills(skillDefinitions: SkillDefinitions) {
  const skills: Record<string, number> = {};

  Object.values(skillDefinitions.classes).forEach((tankSkills) => {
    tankSkills.forEach((skill) => {
      skills[skill] = permanentSkills.includes(skill) ? 7 : 0;
    });
  });

  return skills;
}
