import { provisionDefinitions, TREE_TYPE_ICONS } from '@blitzkit/core';
import { CaretRightIcon, UpdateIcon } from '@radix-ui/react-icons';
import { Button, Dialog, Flex, Heading } from '@radix-ui/themes';
import Link from 'next/link';
import { use, useState } from 'react';
import { pushTankopediaPath } from '../../../../../core/blitzkit/pushTankopediaPath';
import { tankToDuelMember } from '../../../../../core/blitzkit/tankToDuelMember';
import * as Duel from '../../../../../stores/duel';
import { TankSearch } from '../../components/TankSearch';

export function Title() {
  const awaitedProvisionDefinitions = use(provisionDefinitions);
  const protagonist = Duel.use((state) => state.protagonist);
  const antagonist = Duel.use((state) => state.antagonist);
  const compareTanks =
    protagonist.tank.id === antagonist.tank.id
      ? [protagonist.tank.id]
      : [protagonist.tank.id, antagonist.tank.id];
  const [changeTankDialogOpen, setChangeTankDialogOpen] = useState(false);
  const mutateDuel = Duel.useMutation();

  return (
    <>
      <Flex
        gap="6"
        justify="center"
        align="center"
        style={{ padding: 16 }}
        wrap="wrap"
      >
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
                alt={protagonist.tank.name}
                src={
                  TREE_TYPE_ICONS[protagonist.tank.treeType][
                    protagonist.tank.class
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

        <Flex gap="6">
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
              <Dialog.Title align="center">Change tank</Dialog.Title>

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
                      setChangeTankDialogOpen(false);
                      pushTankopediaPath(tank.id);

                      mutateDuel((draft) => {
                        draft.protagonist = tankToDuelMember(
                          tank,
                          awaitedProvisionDefinitions,
                        );
                      });
                    }}
                  />
                </Flex>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>

          <Link href={`/tools/compare?tanks=${compareTanks.join('%2C')}`}>
            <Button variant="ghost">
              Compare <CaretRightIcon />
            </Button>
          </Link>
        </Flex>
      </Flex>
    </>
  );
}
