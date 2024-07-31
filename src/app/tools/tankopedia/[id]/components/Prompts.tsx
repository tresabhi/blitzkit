import { Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes';
import { useRef } from 'react';
import { ModelArmor } from '../../../../../core/blitzkit/modelDefinitions';
import { resolveArmorIndex } from '../../../../../core/blitzkit/resolveArmorIndex';
import * as Duel from '../../../../../stores/duel';
import * as TankopediaEphemeral from '../../../../../stores/tankopediaEphemeral';

export function Prompts() {
  const input = useRef<HTMLInputElement>(null);
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();
  const editingPlate = TankopediaEphemeral.use((state) => state.editingPlate);
  const duelStore = Duel.useStore();

  return (
    <Dialog.Root
      open={editingPlate !== undefined}
      onOpenChange={() => {
        mutateTankopediaEphemeral((draft) => {
          draft.editingPlate = undefined;
        });
      }}
    >
      <Dialog.Content style={{ width: 'fit-content' }}>
        <Flex align="center" gap="2" direction="column">
          <Text>Edit thickness</Text>

          <TextField.Root
            mt="2"
            ref={input}
            type="number"
            onFocus={() => {
              input.current?.select();
            }}
            onKeyDown={(event) => {
              if (!editingPlate) return;

              if (event.key === 'Enter') {
                input.current?.blur();
                mutateTankopediaEphemeral((draft) => {
                  draft.editingPlate = undefined;
                  draft.highlightArmor = undefined;
                  const { protagonist } = duelStore.getState();
                  let armor: ModelArmor;

                  if (editingPlate.name.startsWith('hull_')) {
                    armor = draft.model.armor;
                  } else if (editingPlate.name.startsWith('turret_')) {
                    armor = draft.model.turrets[protagonist.turret.id].armor;
                  } else if (editingPlate.name.startsWith('gun_')) {
                    armor =
                      draft.model.turrets[protagonist.turret.id].guns[
                        protagonist.gun.id
                      ].armor;
                  } else return;

                  const index = resolveArmorIndex(editingPlate.name);

                  if (index === undefined) return;

                  const input = event.currentTarget.valueAsNumber;

                  if (!isNaN(input)) {
                    armor.thickness[index] = input;
                  }
                });
              } else if (event.key === 'Escape') {
                input.current?.blur();
                mutateTankopediaEphemeral((draft) => {
                  draft.highlightArmor = undefined;
                });
              }
            }}
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
            }}
            defaultValue={editingPlate?.default.toFixed(0)}
          >
            <TextField.Slot side="right">mm</TextField.Slot>
          </TextField.Root>

          <Flex gap="2" width="100%">
            <Dialog.Close>
              <Button style={{ flex: 1 }} color="red" variant="outline">
                Cancel
              </Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button style={{ flex: 1 }}>Apply</Button>
            </Dialog.Close>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
