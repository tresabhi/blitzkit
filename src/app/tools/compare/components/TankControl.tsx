import {
  CaretLeftIcon,
  CaretRightIcon,
  ShuffleIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import { Dialog, Flex, IconButton } from '@radix-ui/themes';
import { useState } from 'react';
import { TankDefinition } from '../../../../core/blitzkrieg/tankDefinitions';
import { tankToDuelMember } from '../../../../core/blitzkrieg/tankToDuelMember';
import mutateCompare, { CompareMember } from '../../../../stores/compare';
import { TankSearch } from '../../tankopedia/components/TankSearch';

interface TankControlProps {
  index: number;
  tank: TankDefinition;
  members: CompareMember[];
}

export function TankControl({ index, tank, members }: TankControlProps) {
  const [switchTankDialogOpen, setSwitchTankDialogOpen] = useState(false);

  return (
    <Flex gap="4" style={{ padding: '0 4px' }}>
      {index !== 0 && (
        <IconButton
          variant="ghost"
          onClick={() => {
            mutateCompare((draft) => {
              const item = draft.members[index];
              draft.members.splice(index, 1);
              draft.members.splice(index - 1, 0, item);
            });
          }}
        >
          <CaretLeftIcon />
        </IconButton>
      )}
      <IconButton
        variant="ghost"
        onClick={() => {
          mutateCompare((draft) => {
            draft.members.splice(index, 1);
          });
        }}
      >
        <TrashIcon />
      </IconButton>
      <Dialog.Root
        open={switchTankDialogOpen}
        onOpenChange={setSwitchTankDialogOpen}
      >
        <Dialog.Trigger>
          <IconButton variant="ghost">
            <ShuffleIcon />
          </IconButton>
        </Dialog.Trigger>

        <Dialog.Content>
          <Flex gap="4" direction="column">
            <Flex
              direction="column"
              gap="4"
              style={{ flex: 1 }}
              justify="center"
            >
              <TankSearch
                compact
                onSelect={(tank) => {
                  mutateCompare((draft) => {
                    draft.members[index] = {
                      ...tankToDuelMember(tank),
                      crewSkills: {},
                    };
                  });
                  setSwitchTankDialogOpen(false);
                }}
              />
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
      {index !== members.length - 1 && (
        <IconButton
          variant="ghost"
          onClick={() => {
            mutateCompare((draft) => {
              const item = draft.members[index];
              draft.members.splice(index, 1);
              draft.members.splice(index + 1, 0, item);
            });
          }}
        >
          <CaretRightIcon />
        </IconButton>
      )}
    </Flex>
  );
}
