import { InfoCircledIcon } from '@radix-ui/react-icons';
import {
  Button,
  Flex,
  Heading,
  IconButton,
  Kbd,
  Popover,
  Text,
} from '@radix-ui/themes';
import { use } from 'react';
import { CrewSkillManager } from '../../../../../../../../components/CrewSkillManager';
import { createDefaultSkills } from '../../../../../../../../core/blitzrinth/createDefaultSkills';
import { skillDefinitions } from '../../../../../../../../core/blitzrinth/skillDefinitions';
import {
  mutateTankopediaTemporary,
  useTankopediaTemporary,
} from '../../../../../../../../stores/tankopedia';
import { ConfigurationChildWrapper } from '../ConfigurationChildWrapper';

export function Skills() {
  const awaitedSkillDefinitions = use(skillDefinitions);
  const skillLevels = useTankopediaTemporary((state) => state.skills);

  if (Object.keys(skillLevels).length === 0) {
    mutateTankopediaTemporary((draft) => {
      draft.skills = createDefaultSkills(awaitedSkillDefinitions);
    });

    return null;
  }

  return (
    <ConfigurationChildWrapper>
      <Flex gap="4" align="center">
        <Flex gap="2" align="center">
          <Heading size="4">Crew skills</Heading>

          <Popover.Root>
            <Popover.Trigger>
              <IconButton variant="ghost">
                <InfoCircledIcon />
              </IconButton>
            </Popover.Trigger>

            <Popover.Content>
              <Flex direction="column" gap="2">
                <Text>
                  <Text color="amber">Yellow skills</Text> only apply under
                  special circumstances.
                </Text>

                <Text>
                  Hold <Kbd>Shift</Kbd> to quickly toggle between level 0 and 7.
                </Text>
              </Flex>
            </Popover.Content>
          </Popover.Root>
        </Flex>

        <Button
          variant="ghost"
          color="red"
          onClick={() => {
            mutateTankopediaTemporary((draft) => {
              Object.keys(draft.skills).forEach((skill) => {
                draft.skills[skill] = 0;
              });
            });
          }}
        >
          Clear
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            mutateTankopediaTemporary((draft) => {
              Object.keys(draft.skills).forEach((skill) => {
                draft.skills[skill] = 7;
              });
            });
          }}
        >
          Maximize
        </Button>
      </Flex>

      <CrewSkillManager
        skillLevels={skillLevels}
        onChange={(skills) => {
          mutateTankopediaTemporary((draft) => {
            draft.skills = skills;
          });
        }}
      />
    </ConfigurationChildWrapper>
  );
}
