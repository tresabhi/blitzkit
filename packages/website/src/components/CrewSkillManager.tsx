import { asset, Tier, TIER_ROMAN_NUMERALS } from '@blitzkit/core';
import { permanentSkills } from '@blitzkit/core/src/blitz/permanentSkills';
import { skillDefinitions } from '@blitzkit/core/src/blitzkit/skillDefinitions';
import { Flex } from '@radix-ui/themes';
import { use } from 'react';
import { GenericTankComponentButton } from './ModuleButtons/GenericTankComponentButton';

interface CrewSkillManagerProps {
  skillLevels: Record<string, number>;
  onChange?: (skillLevels: Record<string, number>) => void;
}

export function CrewSkillManager({
  skillLevels,
  onChange,
}: CrewSkillManagerProps) {
  const awaitedSkillDefinitions = use(skillDefinitions);

  return (
    <Flex direction="column" gap="2">
      {Object.entries(awaitedSkillDefinitions.classes).map(
        ([tankClass, skills]) => (
          <Flex gap="2" key={tankClass}>
            {skills.map((skill) => {
              const level = skillLevels[skill];

              return (
                <GenericTankComponentButton
                  key={skill}
                  special={!permanentSkills.includes(skill)}
                  selected={level > 0}
                  discriminator={
                    level === 0 ? undefined : TIER_ROMAN_NUMERALS[level as Tier]
                  }
                  icon={asset(`icons/skills/${skill}.webp`)}
                  onClick={(event) => {
                    if (!onChange) return;

                    const draft = { ...skillLevels };

                    if (event.shiftKey) {
                      draft[skill] = draft[skill] === 0 ? 7 : 0;
                    } else {
                      draft[skill] = level - 1;
                      if (draft[skill] < 0) draft[skill] = 7;
                    }

                    onChange(draft);
                  }}
                />
              );
            })}
          </Flex>
        ),
      )}
    </Flex>
  );
}
