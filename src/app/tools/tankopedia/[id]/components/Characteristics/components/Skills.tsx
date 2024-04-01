import { Flex, Heading } from '@radix-ui/themes';
import { use } from 'react';
import { GenericTankComponentButton } from '../../../../../../../components/ModuleButtons/GenericTankComponentButton';
import { asset } from '../../../../../../../core/blitzkrieg/asset';
import { skillDefinitions } from '../../../../../../../core/blitzkrieg/skillDefinitions';
import { Tier } from '../../../../../../../core/blitzkrieg/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../../../../../../../core/blitzkrieg/tankDefinitions/constants';
import {
  mutateTankopediaTemporary,
  useTankopediaTemporary,
} from '../../../../../../../stores/tankopedia';
import { ConfigurationChildWrapper } from './ConfigurationChildWrapper';

const usefulSkills = [
  'smooth_turn',
  'soft_recoil',
  'smooth_driving',
  'smooth_turret',
  'virtuoso',
  'camouflage',
];

export function Skills() {
  const awaitedSkillDefinitions = use(skillDefinitions);
  const skillLevels = useTankopediaTemporary((state) => state.skills);

  if (Object.keys(skillLevels).length === 0) {
    mutateTankopediaTemporary((draft) => {
      Object.values(awaitedSkillDefinitions.classes).forEach((skills) => {
        skills.forEach((skill) => {
          draft.skills[skill] = usefulSkills.includes(skill) ? 7 : 0;
        });
      });
    });

    return null;
  }

  return (
    <ConfigurationChildWrapper>
      <Heading size="4">Crew skills</Heading>

      <Flex direction="column" gap="2">
        {Object.entries(awaitedSkillDefinitions.classes).map(
          ([tankClass, skills]) => (
            <Flex gap="2" key={tankClass}>
              {skills.map((skill) => {
                const level = skillLevels[skill];

                return (
                  <GenericTankComponentButton
                    first
                    last
                    selected={level > 0}
                    discriminator={
                      level === 0
                        ? undefined
                        : TIER_ROMAN_NUMERALS[level as Tier]
                    }
                    icon={asset(`icons/skills/${skill}.webp`)}
                    onClick={(event) => {
                      mutateTankopediaTemporary((draft) => {
                        if (event.shiftKey) {
                          draft.skills[skill] =
                            draft.skills[skill] === 0 ? 7 : 0;
                        } else {
                          draft.skills[skill] = level - 1;
                          if (draft.skills[skill] < 0) draft.skills[skill] = 7;
                        }
                      });
                    }}
                  />
                );
              })}
            </Flex>
          ),
        )}
      </Flex>
    </ConfigurationChildWrapper>
  );
}
