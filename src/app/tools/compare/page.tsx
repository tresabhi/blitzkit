'use client';

import {
  CaretLeftIcon,
  CaretRightIcon,
  PlusIcon,
  ShuffleIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import {
  Button,
  Dialog,
  Flex,
  IconButton,
  Table,
  Text,
} from '@radix-ui/themes';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { use, useCallback, useEffect, useMemo, useState } from 'react';
import PageWrapper from '../../../components/PageWrapper';
import { equipmentDefinitions } from '../../../core/blitzkrieg/equipmentDefinitions';
import { modelDefinitions } from '../../../core/blitzkrieg/modelDefinitions';
import { provisionDefinitions } from '../../../core/blitzkrieg/provisionDefinitions';
import { tankCharacteristics } from '../../../core/blitzkrieg/tankCharacteristics';
import { tankDefinitions } from '../../../core/blitzkrieg/tankDefinitions';
import { tankIcon } from '../../../core/blitzkrieg/tankIcon';
import { tankToDuelMember } from '../../../core/blitzkrieg/tankToDuelMember';
import mutateCompare, {
  CompareMember,
  useCompare,
} from '../../../stores/compare';
import { TankSearch } from '../tankopedia/components/TankSearch';

export default function Page() {
  const pathname = usePathname();
  const router = useRouter();
  const awaitedTankDefinitions = use(tankDefinitions);
  const searchParams = useSearchParams();
  const tanks = useCompare((state) => state.tanks);
  const [addTankDialogOpen, setAddTankDialogOpen] = useState(false);
  const awaitedModelDefinitions = use(modelDefinitions);
  const awaitedEquipmentDefinitions = use(equipmentDefinitions);
  const awaitedProvisionDefinitions = use(provisionDefinitions);
  const stats = useMemo(
    () =>
      tanks.map((item) =>
        tankCharacteristics(
          {
            ...item,
            stockEngine: item.tank.engines[0],
            stockGun: item.tank.turrets[0].guns[0],
            stockTrack: item.tank.tracks[0],
            stockTurret: item.tank.turrets[0],
          },
          {
            equipmentDefinitions: awaitedEquipmentDefinitions,
            modelDefinitions: awaitedModelDefinitions,
            provisionDefinitions: awaitedProvisionDefinitions,
          },
        ),
      ),
    [tanks],
  );
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  const hasNonRegularGun = tanks.some(({ gun }) => gun.type !== 'regular');

  useEffect(() => {
    router.push(
      pathname +
        '?' +
        createQueryString('tanks', tanks.map(({ tank }) => tank.id).join(',')),
    );
  }, [tanks]);
  useEffect(() => {
    const tanksParam = searchParams.get('tanks');

    if (tanksParam) {
      mutateCompare((draft) => {
        draft.tanks = tanksParam
          .split(',')
          .map(Number)
          .map(
            (id) =>
              ({
                ...tankToDuelMember(awaitedTankDefinitions[id]),
                crewSkills: {},
              }) satisfies CompareMember,
          );
      });
    }
  }, []);

  function Row({
    value,
    name,
    display,
    deltaType = 'higherIsBetter',
  }: {
    name: string;
    value:
      | keyof Awaited<ReturnType<typeof tankCharacteristics>>
      | ((
          member: Awaited<ReturnType<typeof tankCharacteristics>>,
        ) => number | undefined);
    display: (
      member: Awaited<ReturnType<typeof tankCharacteristics>>,
    ) => number | string | undefined;
    deltaType?: 'higherIsBetter' | 'lowerIsBetter';
  }) {
    const values = stats.map((stat) =>
      typeof value === 'function' ? value(stat) : (stat[value] as number),
    );

    return (
      <Table.Row>
        <Table.RowHeaderCell>
          <Flex
            align="center"
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            {name}
          </Flex>
        </Table.RowHeaderCell>

        {values.map((value, index) => (
          <Table.Cell key={index}>
            <Flex
              align="center"
              justify="center"
              style={{
                width: '100%',
                height: '100%',
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                }}
                color={
                  index === 0 || value === undefined || values[0] === undefined
                    ? undefined
                    : (deltaType ? value > values[0] : value < values[0])
                      ? 'green'
                      : 'red'
                }
              >
                {display(stats[index])}
              </Text>
            </Flex>
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
                        ...tankToDuelMember(tank),
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

                {tanks.map(({ tank }, index) => {
                  return (
                    <Table.ColumnHeaderCell width="0" key={tank.id}>
                      <Flex gap="4" style={{ padding: '0 4px' }}>
                        {index !== 0 && (
                          <IconButton
                            variant="ghost"
                            onClick={() => {
                              mutateCompare((draft) => {
                                const item = draft.tanks[index];
                                draft.tanks.splice(index, 1);
                                draft.tanks.splice(index - 1, 0, item);
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
                              draft.tanks.splice(index, 1);
                            });
                          }}
                        >
                          <TrashIcon />
                        </IconButton>
                        <Dialog.Root
                          open={addTankDialogOpen}
                          onOpenChange={setAddTankDialogOpen}
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
                                      draft.tanks[index] = {
                                        ...tankToDuelMember(tank),
                                        crewSkills: {},
                                      };
                                    });
                                    setAddTankDialogOpen(false);
                                  }}
                                />
                              </Flex>
                            </Flex>
                          </Dialog.Content>
                        </Dialog.Root>
                        {index !== tanks.length - 1 && (
                          <IconButton
                            variant="ghost"
                            onClick={() => {
                              mutateCompare((draft) => {
                                const item = draft.tanks[index];
                                draft.tanks.splice(index, 1);
                                draft.tanks.splice(index + 1, 0, item);
                              });
                            }}
                          >
                            <CaretRightIcon />
                          </IconButton>
                        )}
                      </Flex>
                    </Table.ColumnHeaderCell>
                  );
                })}
              </Table.Row>
            </Table.Header>

            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell />

                {tanks.map(({ tank }) => {
                  return (
                    <Table.ColumnHeaderCell width="0" key={tank.id}>
                      <Flex
                        direction="column"
                        align="center"
                        justify="between"
                        gap="2"
                        style={{ height: '100%' }}
                      >
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
              <Row
                name="DPM"
                value="dpm"
                display={(stats) => Math.round(stats.dpm).toLocaleString()}
              />
              <Row
                name="Reload"
                deltaType="lowerIsBetter"
                value={(stats) => stats.shellReload}
                display={(stats) =>
                  stats.shellReload?.toFixed(2) ??
                  stats
                    .shellReloads!.map((reload) => reload.toFixed(2))
                    .join(', ')
                }
              />
              {hasNonRegularGun && (
                <Row
                  name="Intra-clip"
                  value={(stat) => stat.intraClip}
                  display={(stats) => stats.intraClip?.toFixed(2)}
                />
              )}
              <Row
                name="Caliber"
                value="caliber"
                display={(stats) => stats.caliber.toFixed(0)}
              />
              <Row
                name="Penetration"
                value="penetration"
                display={(stats) => stats.penetration.toFixed(0)}
              />
            </Table.Body>
          </Table.Root>
        </Flex>
      )}
    </PageWrapper>
  );
}
