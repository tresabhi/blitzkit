'use client';

import { PlusIcon } from '@radix-ui/react-icons';
import { Button, Dialog, Flex, Table, Text } from '@radix-ui/themes';
import { useSearchParams } from 'next/navigation';
import { use, useState } from 'react';
import PageWrapper from '../../../components/PageWrapper';
import { tankCharacteristics } from '../../../core/blitzkrieg/tankCharacteristics';
import { tankIcon } from '../../../core/blitzkrieg/tankIcon';
import mutateCompare, { useCompare } from '../../../stores/compare';
import { genericDefaultEquipmentMatrix } from '../../../stores/duel/constants';
import { TankSearch } from '../tankopedia/components/TankSearch';

export default function Page() {
  const searchParams = useSearchParams();
  const tanks = useCompare((state) => state.tanks);
  const [addTankDialogOpen, setAddTankDialogOpen] = useState(false);
  const stats = use(
    Promise.all(
      tanks.map((item) =>
        tankCharacteristics({
          ...item,
          stockEngine: item.tank.engines[0],
          stockGun: item.tank.turrets[0].guns[0],
          stockTrack: item.tank.tracks[0],
          stockTurret: item.tank.turrets[0],
        }),
      ),
    ),
  );

  function Row({
    value,
    decimals,
    name,
  }: {
    name: string;
    value: (member: Awaited<ReturnType<typeof tankCharacteristics>>) => number;
    decimals?: number;
  }) {
    const values = stats.map(value);

    return (
      <Table.Row>
        <Table.RowHeaderCell>{name}</Table.RowHeaderCell>

        {values.map((value, index) => (
          <Table.Cell key={index}>
            <Text
              color={
                index === 0 ? undefined : value > values[0] ? 'green' : 'red'
              }
            >
              {decimals === undefined ? value : value.toFixed(decimals)}
            </Text>
          </Table.Cell>
        ))}
      </Table.Row>
    );
  }

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
                    mutateCompare((draft) => {
                      draft.tanks.push({
                        camouflage: true,
                        consumables: [],
                        equipmentMatrix: genericDefaultEquipmentMatrix,
                        cooldownBooster: 0,
                        crewMastery: 1,
                        provisions: [],
                        engine: tank.engines.at(-1)!,
                        gun: tank.turrets.at(-1)!.guns.at(-1)!,
                        shell: tank.turrets.at(-1)!.guns.at(-1)!.shells[0],
                        tank,
                        track: tank.tracks.at(-1)!,
                        yaw: 0,
                        pitch: 0,
                        turret: tank.turrets.at(-1)!,
                        crewSkills: {},
                      });
                    });

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
                <Table.ColumnHeaderCell />

                {tanks.map(({ tank }) => {
                  return (
                    <Table.ColumnHeaderCell width="0" key={tank.id}>
                      <Flex direction="column" align="center">
                        <img
                          src={tankIcon(tank.id)}
                          width={64}
                          height={64}
                          style={{
                            objectFit: 'contain',
                          }}
                        />
                        <Text style={{ textAlign: 'center' }}>{tank.name}</Text>
                      </Flex>
                    </Table.ColumnHeaderCell>
                  );
                })}
              </Table.Row>
            </Table.Header>

            <Table.Body>
              <Row name="DPM" value={(stats) => stats.dpm} decimals={0} />
            </Table.Body>
          </Table.Root>
        </Flex>
      )}
    </PageWrapper>
  );
}
