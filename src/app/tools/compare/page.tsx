'use client';

import {
  CaretLeftIcon,
  CaretRightIcon,
  CaretSortIcon,
  ComponentPlaceholderIcon,
  PlusIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import {
  Button,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Popover,
  SegmentedControl,
  Table,
  Text,
} from '@radix-ui/themes';
import { times } from 'lodash';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { use, useCallback, useEffect, useMemo, useState } from 'react';
import { ConsumablesManager } from '../../../components/ConsumablesManager';
import { EquipmentManager } from '../../../components/EquipmentManager';
import { ModuleManager } from '../../../components/ModuleManager';
import PageWrapper from '../../../components/PageWrapper';
import { ProvisionsManager } from '../../../components/ProvisionsManager';
import { asset } from '../../../core/blitzkrieg/asset';
import { availableProvisions } from '../../../core/blitzkrieg/availableProvisions';
import { checkConsumableProvisionInclusivity } from '../../../core/blitzkrieg/checkConsumableProvisionInclusivity';
import { consumableDefinitions } from '../../../core/blitzkrieg/consumableDefinitions';
import { createDefaultSkills } from '../../../core/blitzkrieg/createDefaultSkills';
import { equipmentDefinitions } from '../../../core/blitzkrieg/equipmentDefinitions';
import { modelDefinitions } from '../../../core/blitzkrieg/modelDefinitions';
import { provisionDefinitions } from '../../../core/blitzkrieg/provisionDefinitions';
import { skillDefinitions } from '../../../core/blitzkrieg/skillDefinitions';
import { tankCharacteristics } from '../../../core/blitzkrieg/tankCharacteristics';
import {
  TankDefinition,
  tankDefinitions,
} from '../../../core/blitzkrieg/tankDefinitions';
import { tankIcon } from '../../../core/blitzkrieg/tankIcon';
import { tankToCompareMember } from '../../../core/blitzkrieg/tankToCompareMember';
import { theme } from '../../../stitches.config';
import {
  DeltaMode,
  mutateComparePersistent,
  mutateCompareTemporary,
  useComparePersistent,
  useCompareTemporary,
} from '../../../stores/compare';
import { EquipmentMatrix } from '../../../stores/duel';
import { TankSearch } from '../tankopedia/components/TankSearch';
import { TankControl } from './components/TankControl';

export default function Page() {
  const pathname = usePathname();
  const router = useRouter();
  const awaitedTankDefinitions = use(tankDefinitions);
  const awaitedSkillDefinitions = use(skillDefinitions);
  const awaitedConsumableDefinitions = use(consumableDefinitions);
  const searchParams = useSearchParams();
  const members = useCompareTemporary((state) => state.members);
  const [addTankDialogOpen, setAddTankDialogOpen] = useState(false);
  const sorting = useCompareTemporary((state) => state.sorting);
  const awaitedModelDefinitions = use(modelDefinitions);
  const awaitedEquipmentDefinitions = use(equipmentDefinitions);
  const awaitedProvisionDefinitions = use(provisionDefinitions);
  const deltaMode = useComparePersistent((state) => state.deltaMode);
  const crewSkills = useCompareTemporary((state) => state.crewSkills);
  const stats = useMemo(
    () =>
      members.map((item) =>
        tankCharacteristics(
          {
            ...item,
            crewSkills,
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
    [members],
  );
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  const hasNonRegularGun = members.some(({ gun }) => gun.type !== 'regular');

  useEffect(() => {
    router.push(
      pathname +
        '?' +
        createQueryString(
          'tanks',
          members.map(({ tank }) => tank.id).join(','),
        ),
    );
  }, [members]);

  useEffect(() => {
    const tanksParam = searchParams.get('tanks');

    if (tanksParam) {
      mutateCompareTemporary((draft) => {
        draft.members = tanksParam
          .split(',')
          .map(Number)
          .map((id) =>
            tankToCompareMember(
              awaitedTankDefinitions[id],
              awaitedProvisionDefinitions,
            ),
          );
      });
    }

    if (Object.keys(crewSkills).length === 0) {
      mutateCompareTemporary((draft) => {
        draft.crewSkills = createDefaultSkills(awaitedSkillDefinitions);
      });
    }
  }, []);

  function Row({
    value,
    name,
    display,
    deltaType = 'higherIsBetter',
    decimals,
    deltaNominalDisplay,
  }: {
    name: string;
    value:
      | keyof Awaited<ReturnType<typeof tankCharacteristics>>
      | ((
          member: Awaited<ReturnType<typeof tankCharacteristics>>,
        ) => number | undefined);
    display?: (
      member: Awaited<ReturnType<typeof tankCharacteristics>>,
    ) => number | string | undefined;
    deltaType?: 'higherIsBetter' | 'lowerIsBetter';
    decimals?: number;
    deltaNominalDisplay?: (delta: number) => string | number;
  }) {
    const values = stats.map((stat) =>
      typeof value === 'function' ? value(stat)! : (stat[value] as number),
    );

    return (
      <Table.Row>
        <Table.RowHeaderCell>
          <Flex
            align="center"
            gap="2"
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            <IconButton
              color={sorting?.by === name ? undefined : 'gray'}
              variant="ghost"
              onClick={() => {
                mutateCompareTemporary((draft) => {
                  draft.members.sort((memberA, memberB) => {
                    const indexA = draft.members.indexOf(memberA);
                    const indexB = draft.members.indexOf(memberB);
                    const valueA = values[indexA];
                    const valueB = values[indexB];

                    return draft.sorting?.direction === 'ascending' &&
                      draft.sorting.by === name
                      ? valueA - valueB
                      : valueB - valueA;
                  });

                  draft.sorting = {
                    by: name,
                    direction:
                      draft.sorting?.direction === 'ascending' &&
                      draft.sorting.by === name
                        ? 'descending'
                        : 'ascending',
                  };
                });
              }}
            >
              {(sorting === undefined || sorting.by !== name) && (
                <CaretSortIcon style={{ transform: 'rotate(90deg)' }} />
              )}
              {sorting?.by === name && (
                <>
                  {sorting.direction === 'ascending' && <CaretRightIcon />}
                  {sorting.direction === 'descending' && <CaretLeftIcon />}
                </>
              )}
            </IconButton>

            {name}
          </Flex>
        </Table.RowHeaderCell>

        {values.map((value, index) => {
          const delta = value - values[0];
          const deltaPercentage = value / values[0] - 1;
          const normalizedDeltaPercentage = Math.round(
            Math.min(100, Math.abs(deltaPercentage) * 2 * 100 + 25),
          );
          const resolvedDisplayValue = display
            ? display(stats[index])
            : decimals === undefined
              ? value
              : value?.toFixed(decimals);

          return (
            <Table.Cell
              key={index}
              style={{
                backgroundColor:
                  index === 0 ||
                  value === undefined ||
                  values[0] === undefined ||
                  value === values[0]
                    ? undefined
                    : (
                          deltaType === 'higherIsBetter'
                            ? value > values[0]
                            : value < values[0]
                        )
                      ? `color-mix(in srgb, ${theme.colors.componentCallToActionInteractive_green} ${normalizedDeltaPercentage}%, ${theme.colors.componentCallToActionInteractive_green}00)`
                      : `color-mix(in srgb, ${theme.colors.componentCallToActionInteractive_red} ${normalizedDeltaPercentage}%, ${theme.colors.componentCallToActionInteractive_red}00)`,
              }}
            >
              <Flex
                align="center"
                justify="center"
                gap="2"
                style={{
                  width: '100%',
                  height: '100%',
                }}
              >
                <Text style={{ textAlign: 'center' }} wrap="nowrap">
                  {resolvedDisplayValue}
                </Text>

                {delta !== 0 &&
                  resolvedDisplayValue !== undefined &&
                  values[0] !== undefined && (
                    <>
                      {deltaMode === 'absolute' && (
                        <Text color="gray">
                          (
                          {`${delta > 0 ? '+' : ''}${
                            deltaNominalDisplay
                              ? deltaNominalDisplay(delta)
                              : decimals === undefined
                                ? delta
                                : delta.toFixed(decimals)
                          }`}
                          )
                        </Text>
                      )}

                      {deltaMode === 'percentage' && (
                        <Text color="gray">
                          (
                          {`${deltaPercentage > 0 ? '+' : ''}${Math.round(
                            deltaPercentage * 100,
                          )}%`}
                          )
                        </Text>
                      )}
                    </>
                  )}
              </Flex>
            </Table.Cell>
          );
        })}
      </Table.Row>
    );
  }

  function Title({ children }: { children: string }) {
    return (
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>
            <Heading size="4">{children}</Heading>
          </Table.ColumnHeaderCell>

          {members.map(({ key }) => (
            <Table.ColumnHeaderCell key={key} />
          ))}
        </Table.Row>
      </Table.Header>
    );
  }

  function TankCard({ index, tank }: { index: number; tank: TankDefinition }) {
    return (
      <Table.ColumnHeaderCell width="0" style={{ left: 0 }}>
        <Flex
          direction="column"
          align="center"
          justify="between"
          gap="2"
          style={{ height: '100%' }}
        >
          <TankControl
            index={index}
            key={tank.id}
            tank={tank}
            members={members}
          />
          <img
            src={tankIcon(tank.id)}
            width={64}
            height={64}
            style={{
              objectFit: 'contain',
            }}
          />

          <Text
            style={{
              whiteSpace: 'nowrap',
              maxWidth: 128,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {tank.name}
          </Text>
        </Flex>
      </Table.ColumnHeaderCell>
    );
  }

  return (
    <PageWrapper color="crimson" size="100%">
      <Flex justify="center" gap="2" align="center" mt="4" direction="column">
        <Flex gap="2">
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
                      mutateCompareTemporary((draft) => {
                        draft.members.push(
                          tankToCompareMember(
                            tank,
                            awaitedProvisionDefinitions,
                          ),
                        );
                        draft.sorting = undefined;
                      });
                      setAddTankDialogOpen(false);
                    }}
                    onSelectAll={(tanks) => {
                      mutateCompareTemporary((draft) => {
                        draft.members.push(
                          ...tanks.map((tank) =>
                            tankToCompareMember(
                              tank,
                              awaitedProvisionDefinitions,
                            ),
                          ),
                        );
                        draft.sorting = undefined;
                      });
                      setAddTankDialogOpen(false);
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
              mutateCompareTemporary((draft) => {
                draft.members = [];
                draft.sorting = undefined;
              });
            }}
          >
            <TrashIcon /> Clear
          </Button>
        </Flex>

        <SegmentedControl.Root
          value={deltaMode}
          onValueChange={(value) => {
            mutateComparePersistent((draft) => {
              draft.deltaMode = value as DeltaMode;
            });
          }}
        >
          <SegmentedControl.Item value={'none' satisfies DeltaMode}>
            No deltas
          </SegmentedControl.Item>
          <SegmentedControl.Item value={'percentage' satisfies DeltaMode}>
            Percentage
          </SegmentedControl.Item>
          <SegmentedControl.Item value={'absolute' satisfies DeltaMode}>
            Absolute
          </SegmentedControl.Item>
        </SegmentedControl.Root>
      </Flex>

      {members.length > 0 && (
        <Flex justify="center">
          <Table.Root variant="surface" style={{ maxWidth: '100%' }}>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell width="0" />

                {members.map(({ tank, key }, index) => {
                  return <TankCard index={index} key={key} tank={tank} />;
                })}
              </Table.Row>
            </Table.Header>

            <Table.Body>
              <Table.Row>
                <Table.Cell>
                  <Flex
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                    align="center"
                    justify="center"
                  >
                    <Popover.Root>
                      <Popover.Trigger>
                        <Button variant="ghost" radius="large">
                          <Flex
                            gap="1"
                            align="center"
                            justify="center"
                            direction="column"
                          >
                            Skills
                            <Flex
                              direction="column"
                              style={{
                                gap: 2,
                              }}
                            >
                              {Object.entries(
                                awaitedSkillDefinitions.classes,
                              ).map(([tankClass, skills]) => (
                                <Flex
                                  key={tankClass}
                                  style={{
                                    gap: 2,
                                  }}
                                >
                                  {skills.map((skill) => (
                                    <div
                                      key={skill}
                                      style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: 2,
                                        backgroundColor:
                                          crewSkills[skill] === 0
                                            ? theme.colors.textLowContrast
                                            : theme.colors
                                                .textLowContrast_crimson,
                                      }}
                                    />
                                  ))}
                                </Flex>
                              ))}
                            </Flex>
                          </Flex>
                        </Button>
                      </Popover.Trigger>

                      <Popover.Content>
                        <Heading>ඞ</Heading>
                      </Popover.Content>
                    </Popover.Root>
                  </Flex>
                </Table.Cell>

                {members.map(
                  (
                    {
                      equipmentMatrix,
                      tank,
                      key,
                      provisions,
                      gun,
                      shell,
                      turret,
                      engine,
                      track,
                      consumables,
                    },
                    index,
                  ) => {
                    const equipmentPreset =
                      awaitedEquipmentDefinitions.presets[tank.equipment];
                    const provisionsList = availableProvisions(
                      tank,
                      gun,
                      awaitedProvisionDefinitions,
                    );
                    const consumablesList = Object.values(
                      awaitedConsumableDefinitions,
                    ).filter((consumable) =>
                      checkConsumableProvisionInclusivity(
                        consumable,
                        tank,
                        gun,
                      ),
                    );

                    return (
                      <Table.Cell key={key}>
                        <Flex
                          align="center"
                          justify="center"
                          direction="column"
                          gap="2"
                          style={{
                            width: '100%',
                            height: '100%',
                          }}
                        >
                          <Popover.Root>
                            <Popover.Trigger>
                              <Button variant="ghost">
                                <Flex align="center">
                                  {(
                                    [
                                      'turret',
                                      'gun',
                                      'engine',
                                      'chassis',
                                    ] as const
                                  ).map((module, index) => (
                                    <img
                                      width={24}
                                      height={24}
                                      src={asset(
                                        `icons/modules/${module}.webp`,
                                      )}
                                      style={{
                                        marginLeft: index > 0 ? -8 : 0,
                                        objectFit: 'contain',
                                      }}
                                    />
                                  ))}
                                </Flex>
                              </Button>
                            </Popover.Trigger>

                            <Popover.Content>
                              <ModuleManager
                                tank={tank}
                                turret={turret}
                                gun={gun}
                                shell={shell}
                                engine={engine}
                                track={track}
                                onChange={(modules) => {
                                  mutateCompareTemporary((draft) => {
                                    draft.members[index] = {
                                      ...draft.members[index],
                                      ...modules,
                                    };
                                  });
                                }}
                              />

                              <Flex justify="end" mt="4" gap="4">
                                <Button
                                  variant="ghost"
                                  onClick={() => {
                                    mutateCompareTemporary((draft) => {
                                      const member = draft.members[index];

                                      member.turret = member.tank.turrets[0];
                                      member.gun = member.turret.guns[0];
                                      member.shell = member.gun.shells[0];
                                      member.engine = member.tank.engines[0];
                                      member.track = member.tank.tracks[0];
                                    });
                                  }}
                                >
                                  Stock
                                </Button>
                                <Button
                                  variant="ghost"
                                  onClick={() => {
                                    mutateCompareTemporary((draft) => {
                                      const member = draft.members[index];

                                      member.turret =
                                        member.tank.turrets.at(-1)!;
                                      member.gun = member.turret.guns.at(-1)!;
                                      member.shell = member.gun.shells[0];
                                      member.engine =
                                        member.tank.engines.at(-1)!;
                                      member.track = member.tank.tracks.at(-1)!;
                                    });
                                  }}
                                >
                                  Upgrade
                                </Button>
                              </Flex>
                            </Popover.Content>
                          </Popover.Root>

                          <Flex align="center" justify="center" gap="3">
                            <Popover.Root>
                              <Popover.Trigger>
                                <Button
                                  variant="ghost"
                                  radius="large"
                                  style={{
                                    height: '100%',
                                    width: 12,
                                    position: 'relative',
                                  }}
                                >
                                  <Flex direction="column" justify="center">
                                    {provisions.map((provision, index) => (
                                      <img
                                        key={provision}
                                        src={asset(
                                          `/icons/provisions/${provision}.webp`,
                                        )}
                                        style={{
                                          left: '50%',
                                          /**
                                           * max = 100% - 16px - 4px
                                           * min = 4px
                                           * diff = max - min
                                           *      = 100% - 16px - 4px - 4px
                                           *      = 100% - 24px
                                           * coefficient = index / length - 1
                                           * position = min + coefficient * diff
                                           */
                                          top: `calc(4px + ${
                                            provisions.length === 1
                                              ? 0.5
                                              : index / (provisions.length - 1)
                                          } * (100% - 24px))`,
                                          transform: 'translateX(-50%)',
                                          position: 'absolute',
                                          width: 16,
                                          height: 16,
                                          objectFit: 'contain',
                                        }}
                                      />
                                    ))}

                                    {provisions.length === 0 && (
                                      <ComponentPlaceholderIcon />
                                    )}
                                  </Flex>
                                </Button>
                              </Popover.Trigger>

                              <Popover.Content>
                                <ProvisionsManager
                                  provisions={provisionsList.map(
                                    (provision) => provision.id,
                                  )}
                                  selected={provisions}
                                  disabled={
                                    tank.provisions === provisions.length
                                  }
                                  onChange={(provisions) => {
                                    mutateCompareTemporary((draft) => {
                                      draft.members[index].provisions =
                                        provisions;
                                    });
                                  }}
                                />

                                <Flex justify="end" mt="4">
                                  <Button
                                    variant="ghost"
                                    onClick={() => {
                                      mutateCompareTemporary((draft) => {
                                        draft.members[index].provisions = [];
                                      });
                                    }}
                                  >
                                    Clear
                                  </Button>
                                </Flex>
                              </Popover.Content>
                            </Popover.Root>

                            <Popover.Root>
                              <Popover.Trigger>
                                <Button variant="ghost" radius="large">
                                  <Flex gap="1" direction="column">
                                    {times(3, (y) => (
                                      <Flex
                                        key={y}
                                        style={{
                                          gap: 6,
                                        }}
                                      >
                                        {times(3, (x) => {
                                          const equipment =
                                            equipmentMatrix[y][x];

                                          return (
                                            <Flex
                                              key={x}
                                              style={{
                                                gap: 2,
                                              }}
                                            >
                                              <div
                                                style={{
                                                  width: 4,
                                                  height: 8,
                                                  backgroundColor:
                                                    equipment === -1
                                                      ? theme.colors
                                                          .textLowContrast_crimson
                                                      : theme.colors
                                                          .textLowContrast,
                                                  borderRadius: 2,
                                                }}
                                              />
                                              <div
                                                style={{
                                                  width: 4,
                                                  height: 8,
                                                  backgroundColor:
                                                    equipment === 1
                                                      ? theme.colors
                                                          .textLowContrast_crimson
                                                      : theme.colors
                                                          .textLowContrast,
                                                  borderRadius: 2,
                                                }}
                                              />
                                            </Flex>
                                          );
                                        })}
                                      </Flex>
                                    ))}
                                  </Flex>
                                </Button>
                              </Popover.Trigger>

                              <Popover.Content>
                                <EquipmentManager
                                  matrix={equipmentMatrix}
                                  preset={equipmentPreset}
                                  onChange={(matrix) => {
                                    mutateCompareTemporary((draft) => {
                                      draft.members[index].equipmentMatrix =
                                        matrix;
                                      draft.sorting = undefined;
                                    });
                                  }}
                                />

                                <Flex justify="end" gap="4" mt="4">
                                  <Button
                                    variant="ghost"
                                    color="red"
                                    onClick={() => {
                                      mutateCompareTemporary((draft) => {
                                        draft.members[index].equipmentMatrix =
                                          times(3, () =>
                                            times(3, () => 0),
                                          ) as EquipmentMatrix;
                                        draft.sorting = undefined;
                                      });
                                    }}
                                  >
                                    Clear
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    onClick={() => {
                                      mutateCompareTemporary((draft) => {
                                        draft.members.forEach((member) => {
                                          member.equipmentMatrix =
                                            draft.members[
                                              index
                                            ].equipmentMatrix;
                                          draft.sorting = undefined;
                                        });
                                      });
                                    }}
                                  >
                                    Apply to all
                                  </Button>
                                </Flex>
                              </Popover.Content>
                            </Popover.Root>

                            <Popover.Root>
                              <Popover.Trigger>
                                <Button
                                  variant="ghost"
                                  radius="large"
                                  style={{
                                    height: '100%',
                                    width: 12,
                                    position: 'relative',
                                  }}
                                >
                                  <Flex direction="column" justify="center">
                                    {consumables.map((consumable, index) => (
                                      <img
                                        key={consumable}
                                        src={asset(
                                          `/icons/consumables/${consumable}.webp`,
                                        )}
                                        style={{
                                          left: '50%',
                                          /**
                                           * max = 100% - 16px - 4px
                                           * min = 4px
                                           * diff = max - min
                                           *      = 100% - 16px - 4px - 4px
                                           *      = 100% - 24px
                                           * coefficient = index / length - 1
                                           * position = min + coefficient * diff
                                           */
                                          top: `calc(4px + ${
                                            consumables.length === 1
                                              ? 0.5
                                              : index / (consumables.length - 1)
                                          } * (100% - 24px))`,
                                          transform: 'translateX(-50%)',
                                          position: 'absolute',
                                          width: 16,
                                          height: 16,
                                          objectFit: 'contain',
                                        }}
                                      />
                                    ))}

                                    {consumables.length === 0 && (
                                      <ComponentPlaceholderIcon />
                                    )}
                                  </Flex>
                                </Button>
                              </Popover.Trigger>

                              <Popover.Content>
                                <ConsumablesManager
                                  consumables={consumablesList}
                                  selected={consumables}
                                  onChange={(consumables) => {
                                    mutateCompareTemporary((draft) => {
                                      draft.members[index].consumables =
                                        consumables;
                                    });
                                  }}
                                  disabled={
                                    tank.consumables === consumables.length
                                  }
                                />

                                <Flex justify="end" mt="4">
                                  <Button
                                    variant="ghost"
                                    onClick={() => {
                                      mutateCompareTemporary((draft) => {
                                        draft.members[index].consumables = [];
                                      });
                                    }}
                                  >
                                    Clear
                                  </Button>
                                </Flex>
                              </Popover.Content>
                            </Popover.Root>
                          </Flex>
                        </Flex>
                      </Table.Cell>
                    );
                  },
                )}
              </Table.Row>
            </Table.Body>

            <Title>Fire</Title>
            <Table.Body>
              <Row name="DPM" value="dpm" decimals={0} />
              <Row
                name="Reload"
                deltaType="lowerIsBetter"
                value={(stats) =>
                  stats.shellReload ??
                  stats.shellReloads!.reduce((a, b) => a + b, 0) /
                    stats.shellReloads!.length
                }
                display={(stats) =>
                  stats.shellReload?.toFixed(2) ??
                  stats
                    .shellReloads!.map((reload) => reload.toFixed(2))
                    .join(', ')
                }
                deltaNominalDisplay={(delta) => delta.toFixed(2)}
              />
              {hasNonRegularGun && (
                <Row
                  name="Intra-clip"
                  deltaType="lowerIsBetter"
                  value={(stat) => stat.intraClip}
                  decimals={2}
                />
              )}
              <Row name="Caliber" value="caliber" decimals={0} />
              <Row name="Penetration" value="penetration" decimals={0} />
              <Row name="Damage" value="damage" decimals={0} />
              <Row name="Module damage" value="moduleDamage" decimals={0} />
              <Row name="Shell velocity" value="shellVelocity" decimals={0} />
              <Row
                name="Aim time"
                value="aimTime"
                deltaType="lowerIsBetter"
                decimals={2}
              />
              <Row
                name="Dispersion"
                value="dispersion"
                deltaType="lowerIsBetter"
                decimals={3}
              />
              <Row
                name="Dispersion moving"
                value="dispersionMoving"
                deltaType="lowerIsBetter"
                decimals={3}
              />
              <Row
                name="Dispersion hull traversing"
                value="dispersionHullTraversing"
                deltaType="lowerIsBetter"
                decimals={3}
              />
              <Row
                name="Dispersion turret traversing"
                value="dispersionTurretTraversing"
                deltaType="lowerIsBetter"
                decimals={3}
              />
              <Row
                name="Dispersion shooting"
                value="dispersionShooting"
                deltaType="lowerIsBetter"
                decimals={3}
              />
              <Row
                name="Dispersion gun damaged"
                value="dispersionGunDamaged"
                deltaType="lowerIsBetter"
                decimals={3}
              />
              <Row name="Gun depression" value="gunDepression" decimals={1} />
              <Row name="Gun elevation" value="gunElevation" decimals={1} />
            </Table.Body>

            <Title>Maneuverability</Title>
            <Table.Body>
              <Row name="Speed forwards" value="speedForwards" decimals={0} />
              <Row name="Speed backwards" value="speedBackwards" decimals={0} />
              <Row name="Engine power" value="enginePower" decimals={0} />
              <Row
                name="Power to weight ratio hard terrain"
                value="powerToWeightRatioHardTerrain"
                decimals={1}
              />
              <Row
                name="Power to weight ratio medium terrain"
                value="powerToWeightRatioMediumTerrain"
                decimals={1}
              />
              <Row
                name="Power to weight ratio soft terrain"
                value="powerToWeightRatioSoftTerrain"
                decimals={1}
              />
            </Table.Body>

            <Title>Survivability</Title>
            <Table.Body>
              <Row name="Health" value="health" decimals={0} />
              <Row
                name="Fire chance"
                value="fireChance"
                deltaType="lowerIsBetter"
                display={(stats) => (stats.fireChance * 100).toFixed(0)}
                deltaNominalDisplay={(delta) => (delta * 100).toFixed(0)}
              />
              <Row name="View range" value="viewRange" decimals={0} />
              <Row
                name="Camouflage still"
                value="camouflageStill"
                display={(stats) => (stats.camouflageStill * 100).toFixed(0)}
                deltaNominalDisplay={(delta) => (delta * 100).toFixed(0)}
              />
              <Row
                name="Camouflage moving"
                value="camouflageMoving"
                display={(stats) => (stats.camouflageMoving * 100).toFixed(0)}
                deltaNominalDisplay={(delta) => (delta * 100).toFixed(0)}
              />
              <Row
                name="Camouflage shooting still"
                value="camouflageShootingStill"
                display={(stats) =>
                  (stats.camouflageShootingStill * 100).toFixed(0)
                }
                deltaNominalDisplay={(delta) => (delta * 100).toFixed(0)}
              />
              <Row
                name="Camouflage shooting moving"
                value="camouflageShootingMoving"
                display={(stats) =>
                  (stats.camouflageShootingMoving * 100).toFixed(0)
                }
                deltaNominalDisplay={(delta) => (delta * 100).toFixed(0)}
              />
              <Row
                name="Camouflage caught on fire"
                value="camouflageCaughtOnFire"
                display={(stats) =>
                  (stats.camouflageCaughtOnFire * 100).toFixed(0)
                }
                deltaNominalDisplay={(delta) => (delta * 100).toFixed(0)}
              />
              <Row
                name="Width"
                value="width"
                deltaType="lowerIsBetter"
                decimals={1}
              />
              <Row
                name="Height"
                value="height"
                deltaType="lowerIsBetter"
                decimals={1}
              />
              <Row
                name="Length"
                value="length"
                deltaType="lowerIsBetter"
                decimals={1}
              />
              <Row
                name="Volume"
                value="volume"
                deltaType="lowerIsBetter"
                decimals={1}
              />
            </Table.Body>
          </Table.Root>
        </Flex>
      )}

      {members.length === 0 && (
        <Flex
          align="center"
          justify="center"
          direction="column"
          style={{ flex: 1 }}
        >
          <Heading color="gray">No tanks selected</Heading>
          <Text color="gray">
            Press the <PlusIcon /> Add button to get started
          </Text>
        </Flex>
      )}
    </PageWrapper>
  );
}
