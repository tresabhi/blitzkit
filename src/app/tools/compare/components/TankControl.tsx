import { ExternalLinkIcon, LoopIcon, TrashIcon } from '@radix-ui/react-icons';
import { Dialog, Flex, IconButton } from '@radix-ui/themes';
import Link from 'next/link';
import { use, useState } from 'react';
import { provisionDefinitions } from '../../../../core/blitzkit/provisionDefinitions';
import { tankToCompareMember } from '../../../../core/blitzkit/tankToCompareMember';
import * as CompareEphemeral from '../../../../stores/compareEphemeral';
import { TankSearch } from '../../tankopedia/components/TankSearch';

interface TankControlProps {
  index: number;
  id: number;
}

export function TankControl({ index, id }: TankControlProps) {
  const awaitedProvisionDefinitions = use(provisionDefinitions);
  const [switchTankDialogOpen, setSwitchTankDialogOpen] = useState(false);
  const mutateCompareEphemeral = CompareEphemeral.useMutation();

  return (
    <Flex gap="3" justify="center" style={{ width: '100%' }}>
      <IconButton
        variant="ghost"
        onClick={() => {
          mutateCompareEphemeral((draft) => {
            draft.members.splice(index, 1);
            draft.sorting = undefined;
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
            <LoopIcon />
          </IconButton>
        </Dialog.Trigger>

        <Dialog.Content>
          <Dialog.Title align="center">Switch tanks</Dialog.Title>

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
                  mutateCompareEphemeral((draft) => {
                    draft.members[index] = tankToCompareMember(
                      tank,
                      awaitedProvisionDefinitions,
                    );
                    draft.sorting = undefined;
                  });
                  setSwitchTankDialogOpen(false);
                }}
              />
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <Link href={`/tools/tankopedia/${id}`} target="_blank" prefetch={false}>
        <IconButton variant="ghost">
          <ExternalLinkIcon />
        </IconButton>
      </Link>
    </Flex>
  );
}
