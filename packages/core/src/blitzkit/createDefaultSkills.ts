import { SkillDefinitions } from '@blitzkit/core';
import { permanentSkills } from '../blitz/permanentSkills';

export function createDefaultSkills(skillDefinitions: SkillDefinitions) {
  const skills: Record<string, number> = {};

  Object.values(skillDefinitions.classes).forEach((tankSkills) => {
    tankSkills.forEach((skill) => {
      skills[skill] = permanentSkills.includes(skill) ? 7 : 0;
    });
  });

  return skills;
}
