import { UpdateIcon } from '@radix-ui/react-icons';
import { Button, Dialog, Flex, Heading } from '@radix-ui/themes';
import { useState } from 'react';
import { TREE_TYPE_ICONS } from '../../../../../components/Tanks';
import { assignDuelMember } from '../../../../../core/blitzkrieg/assignDuelMember';
import { updateTankopediaUrl } from '../../../../../core/blitzkrieg/updateTankopediaURL';
import { useDuel } from '../../../../../stores/duel';
import { TankSearch } from '../../components/TankSearch';

export function Title() {
  const protagonist = useDuel((state) => state.protagonist!);
  const [changeTankDialogOpen, setChangeTankDialogOpen] = useState(false);

  return (
    <>
      <title>{protagonist.tank.name}</title>

      <Flex gap="6" justify="center" align="center" style={{ padding: 16 }}>
        <Flex gap="2" align="center">
          <Heading
            color={
              protagonist.tank.treeType === 'premium'
                ? 'amber'
                : protagonist.tank.treeType === 'collector'
                  ? 'blue'
                  : undefined
            }
          >
            <Flex align="center" gap="2">
              <img
                src={
                  TREE_TYPE_ICONS[protagonist.tank.treeType][
                    protagonist.tank.type
                  ]
                }
                style={{
                  width: '1em',
                  height: '1em',
                }}
              />{' '}
              {protagonist.tank.name}
            </Flex>
          </Heading>
        </Flex>

        <Dialog.Root
          open={changeTankDialogOpen}
          onOpenChange={setChangeTankDialogOpen}
        >
          <Dialog.Trigger>
            <Button variant="ghost">
              Change <UpdateIcon />
            </Button>
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
                    assignDuelMember('protagonist', tank.id);
                    setChangeTankDialogOpen(false);
                    updateTankopediaUrl(tank.id);
                  }}
                />
              </Flex>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </Flex>
    </>
  );
}
