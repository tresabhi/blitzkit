import { Flex, Heading } from '@radix-ui/themes';
import { use } from 'react';
import { GenericTankComponentButton } from '../../../../../../../components/ModuleButtons/GenericTankComponentButton';
import { asset } from '../../../../../../../core/blitzkrieg/asset';
import { skillDefinitions } from '../../../../../../../core/blitzkrieg/skillDefinitions';
import { Tier } from '../../../../../../../core/blitzkrieg/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../../../../../../../core/blitzkrieg/tankDefinitions/constants';
import mutateTankopediaPersistent, {
  useTankopediaPersistent,
} from '../../../../../../../stores/tankopedia';
import { ConfigurationChildWrapper } from './ConfigurationChildWrapper';

export function Skills() {
  const awaitedSkillDefinitions = use(skillDefinitions);
  const skillLevels = useTankopediaPersistent((state) => state.skills);

  if (Object.keys(skillLevels).length === 0) {
    mutateTankopediaPersistent((draft) => {
      Object.values(awaitedSkillDefinitions.classes).forEach((skills) => {
        skills.forEach((skill) => {
          draft.skills[skill] = 0;
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
                      mutateTankopediaPersistent((draft) => {
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
