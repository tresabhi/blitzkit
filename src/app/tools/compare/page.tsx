'use client';

import { PlusIcon } from '@radix-ui/react-icons';
import { Button, Dialog, Flex, Table, Text } from '@radix-ui/themes';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { use, useCallback, useState } from 'react';
import PageWrapper from '../../../components/PageWrapper';
import { tankDefinitions } from '../../../core/blitzkrieg/tankDefinitions';
import { tankIcon } from '../../../core/blitzkrieg/tankIcon';
import { TankSearch } from '../tankopedia/components/TankSearch';

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tanks = searchParams.get('tanks')?.split(',').map(Number) ?? [];
  const awaitedTankDefinitions = use(tankDefinitions);
  const [addTankDialogOpen, setAddTankDialogOpen] = useState(false);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  return (
    <PageWrapper color="crimson" size="100%">
      <Flex justify="center">
        <Dialog.Root
          open={addTankDialogOpen}
          onOpenChange={setAddTankDialogOpen}
        >
          <Dialog.Trigger>
            <Button>
              <PlusIcon /> Add
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
                    tanks.push(tank.id);
                    router.push(
                      pathname +
                        '?' +
                        createQueryString('tanks', tanks.join(',')),
                    );
                    setAddTankDialogOpen(false);
                  }}
                />
              </Flex>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </Flex>

      {tanks.length > 0 && (
        <Flex justify="center">
          <Table.Root
            variant="surface"
            style={{
              maxWidth: '100%',
            }}
          >
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell width="0">
                  <Flex
                    align="center"
                    justify="center"
                    style={{ width: '100%', height: '100%' }}
                  >
                    Statistics
                  </Flex>
                </Table.ColumnHeaderCell>
                {tanks.map((id) => {
                  const tank = awaitedTankDefinitions[id];

                  return (
                    <Table.ColumnHeaderCell width="0">
                      <Flex direction="column" align="center">
                        <img
                          src={tankIcon(id)}
                          width={64}
                          height={64}
                          style={{
                            objectFit: 'contain',
                          }}
                        />
                        <Text>{tank.name}</Text>
                      </Flex>
                    </Table.ColumnHeaderCell>
                  );
                })}
              </Table.Row>
            </Table.Header>

            <Table.Body>
              <Table.Row>
                <Table.RowHeaderCell>Stat 1</Table.RowHeaderCell>
                {tanks.map((id) => {
                  const tank = awaitedTankDefinitions[id];

                  return <Table.Cell>{Math.random()}</Table.Cell>;
                })}
              </Table.Row>

              <Table.Row>
                <Table.RowHeaderCell>Stat 2</Table.RowHeaderCell>
                {tanks.map((id) => {
                  const tank = awaitedTankDefinitions[id];

                  return <Table.Cell>{Math.random()}</Table.Cell>;
                })}
              </Table.Row>
            </Table.Body>
          </Table.Root>
        </Flex>
      )}
    </PageWrapper>
  );
}
