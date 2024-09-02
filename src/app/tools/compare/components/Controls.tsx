import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { Button, Dialog, Flex, SegmentedControl } from '@radix-ui/themes';
import { use } from 'react';
import { provisionDefinitions } from '../../../../core/blitzkit/provisionDefinitions';
import { tankToCompareMember } from '../../../../core/blitzkit/tankToCompareMember';
import * as CompareEphemeral from '../../../../stores/compareEphemeral';
import * as ComparePersistent from '../../../../stores/comparePersistent';
import { TankSearch } from '../../tankopedia/components/TankSearch';

interface ControlsProps {
  addTankDialogOpen: boolean;
  onAddTankDialogOpenChange: (open: boolean) => void;
}

export function Controls({
  addTankDialogOpen,
  onAddTankDialogOpenChange,
}: ControlsProps) {
  const deltaMode = ComparePersistent.use((state) => state.deltaMode);
  const awaitedProvisionDefinitions = use(provisionDefinitions);
  const mutateCompareEphemeral = CompareEphemeral.useMutation();
  const mutateComparePersistent = ComparePersistent.useMutation();

  return (
    <Flex gap="2" wrap="wrap" justify="center">
      <Dialog.Root
        open={addTankDialogOpen}
        onOpenChange={onAddTankDialogOpenChange}
      >
        <Dialog.Trigger>
          <Button variant="soft">
            <PlusIcon /> Add
          </Button>
        </Dialog.Trigger>

        <Dialog.Content>
          <Dialog.Title align="center">Add tanks</Dialog.Title>

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
                    draft.members.push(
                      tankToCompareMember(tank, awaitedProvisionDefinitions),
                    );
                    draft.sorting = undefined;
                  });
                  onAddTankDialogOpenChange(false);
                }}
                onSelectAll={(tanks) => {
                  mutateCompareEphemeral((draft) => {
                    draft.members.push(
                      ...tanks.map((tank) =>
                        tankToCompareMember(tank, awaitedProvisionDefinitions),
                      ),
                    );
                    draft.sorting = undefined;
                  });
                  onAddTankDialogOpenChange(false);
                }}
              />
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <Button
        variant="soft"
        color="red"
        onClick={() => {
          mutateCompareEphemeral((draft) => {
            draft.members = [];
            draft.sorting = undefined;
          });
        }}
      >
        <TrashIcon /> Clear
      </Button>

      <SegmentedControl.Root
        value={deltaMode}
        onValueChange={(value) => {
          mutateComparePersistent((draft) => {
            draft.deltaMode = value as ComparePersistent.DeltaMode;
          });
        }}
      >
        <SegmentedControl.Item
          value={'none' satisfies ComparePersistent.DeltaMode}
        >
          No deltas
        </SegmentedControl.Item>
        <SegmentedControl.Item
          value={'percentage' satisfies ComparePersistent.DeltaMode}
        >
          Percentage
        </SegmentedControl.Item>
        <SegmentedControl.Item
          value={'absolute' satisfies ComparePersistent.DeltaMode}
        >
          Absolute
        </SegmentedControl.Item>
      </SegmentedControl.Root>
    </Flex>
  );
}
