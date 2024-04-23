'use client';

import {
  CaretLeftIcon,
  CaretRightIcon,
  CaretSortIcon,
  ComponentPlaceholderIcon,
  InfoCircledIcon,
  PlusIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import {
  Button,
  Callout,
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
import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Vector2 } from 'three';
import { ConsumablesManager } from '../../../components/ConsumablesManager';
import { CrewSkillManager } from '../../../components/CrewSkillManager';
import { EquipmentManager } from '../../../components/EquipmentManager';
import { ModuleManager } from '../../../components/ModuleManager';
import PageWrapper from '../../../components/PageWrapper';
import { ProvisionsManager } from '../../../components/ProvisionsManager';
import { asset } from '../../../core/blitzkit/asset';
import { availableProvisions } from '../../../core/blitzkit/availableProvisions';
import { checkConsumableProvisionInclusivity } from '../../../core/blitzkit/checkConsumableProvisionInclusivity';
import { consumableDefinitions } from '../../../core/blitzkit/consumableDefinitions';
import { createDefaultSkills } from '../../../core/blitzkit/createDefaultSkills';
import { equipmentDefinitions } from '../../../core/blitzkit/equipmentDefinitions';
import { modelDefinitions } from '../../../core/blitzkit/modelDefinitions';
import { provisionDefinitions } from '../../../core/blitzkit/provisionDefinitions';
import { skillDefinitions } from '../../../core/blitzkit/skillDefinitions';
import { tankCharacteristics } from '../../../core/blitzkit/tankCharacteristics';
import {
  TankDefinition,
  tankDefinitions,
} from '../../../core/blitzkit/tankDefinitions';
import { tankIcon } from '../../../core/blitzkit/tankIcon';
import { tankToCompareMember } from '../../../core/blitzkit/tankToCompareMember';
import { BlitzkitButtonWatermark } from '../../../icons/BlitzkitButtonWatermark';
import { theme } from '../../../stitches.config';
import {
  DeltaMode,
  mutateComparePersistent,
  mutateCompareTemporary,
  useComparePersistent,
  useCompareTemporary,
} from '../../../stores/compare';
import { EquipmentMatrix } from '../../../stores/duel';
import { permanentSkills } from '../tankopedia/[id]/components/Characteristics/components/Skills/constants';
import { TankSearch } from '../tankopedia/components/TankSearch';
import { TankControl } from './components/TankControl';

const insertionMarkers: { element: HTMLDivElement; index: number }[] = [];

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
  const haveReactive = members.some((member) =>
    member.consumables.includes(33),
  );
  const haveDynamicArmor = members.some((member) =>
    member.consumables.includes(73),
  );
  const haveSpallLiner = members.some((member) =>
    member.provisions.includes(101),
  );
  const stats = useMemo(
    () =>
      members.map((thisMember) =>
        tankCharacteristics(
          {
            ...thisMember,
            crewSkills,
            stockEngine: thisMember.tank.engines[0],
            stockGun: thisMember.tank.turrets[0].guns[0],
            stockTrack: thisMember.tank.tracks[0],
            stockTurret: thisMember.tank.turrets[0],
            applyReactive: members.some(
              (member) =>
                member.key !== thisMember.key &&
                member.consumables.includes(33),
            ),
            applyDynamicArmor: members.some(
              (member) =>
                member.key !== thisMember.key &&
                member.consumables.includes(73),
            ),
            applySpallLiner: members.some(
              (member) =>
                member.key !== thisMember.key &&
                member.provisions.includes(101),
            ),
          },
          {
            equipmentDefinitions: awaitedEquipmentDefinitions,
            modelDefinitions: awaitedModelDefinitions,
            provisionDefinitions: awaitedProvisionDefinitions,
          },
        ),
      ),
    [members, crewSkills],
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
    const draggable = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const initial = new Vector2();
      const current = new Vector2();
      const delta = new Vector2();
      const marker = new Vector2();
      let initialRect = draggable.current!.getBoundingClientRect();
      let dropIndex = -1;

      function handlePointerDown(event: PointerEvent) {
        event.preventDefault();

        initialRect = draggable.current!.getBoundingClientRect();

        delta.set(0, 0);
        current.copy(initial.set(event.clientX, event.clientY));
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
      }
      function handlePointerMove(event: PointerEvent) {
        event.preventDefault();

        current.set(event.clientX, event.clientY);
        delta.copy(current).sub(initial);
        insertionMarkers.forEach(({ element }) => {
          element.style.opacity = '0';
        });

        const distances = insertionMarkers.map((insertionMarker) => {
          const markerBounds = insertionMarker.element.getBoundingClientRect();
          marker.set(markerBounds.left, markerBounds.top);

          return {
            ...insertionMarker,
            distance: marker.distanceTo(current),
          };
        });
        const closest = distances.reduce((a, b) =>
          a.distance < b.distance ? a : b,
        );

        dropIndex = closest.index;
        closest.element.style.opacity = '1';
        draggable.current!.style.position = 'fixed';
        draggable.current!.style.cursor = 'grabbing';
        draggable.current!.style.zIndex = '1';
        draggable.current!.style.left = `${initialRect.left + delta.x}px`;
        draggable.current!.style.top = `${initialRect.top + delta.y}px`;
      }
      function handlePointerUp(event: PointerEvent) {
        event.preventDefault();

        draggable.current!.style.position = 'static';
        draggable.current!.style.zIndex = 'unset';
        draggable.current!.style.cursor = 'grab';

        insertionMarkers.forEach(({ element }) => {
          element.style.opacity = '0';
        });

        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);

        if (dropIndex === -1) return;

        mutateCompareTemporary((draft) => {
          const fromIndex = index;
          const toIndex = dropIndex > index ? dropIndex - 1 : dropIndex;

          const member = draft.members[fromIndex];
          draft.members.splice(fromIndex, 1);
          draft.members.splice(toIndex, 0, member);
        });

        dropIndex = -1;
      }

      draggable.current?.addEventListener('pointerdown', handlePointerDown);

      return () => {
        draggable.current?.removeEventListener(
          'pointerdown',
          handlePointerDown,
        );
      };
    }, []);

    return (
      <Table.ColumnHeaderCell
        width="0"
        style={{ left: 0, position: 'relative' }}
      >
        <Flex
          direction="column"
          align="center"
          justify="between"
          gap="2"
          style={{ height: '100%' }}
        >
          <TankControl index={index} key={tank.id} id={tank.id} />

          <Flex
            ref={draggable}
            direction="column"
            align="center"
            justify="between"
            gap="2"
            style={{
              userSelect: 'none',
              touchAction: 'none',
              cursor: 'grab',
            }}
          >
            <img
              alt={tank.name}
              src={tankIcon(tank.id)}
              width={64}
              height={64}
              draggable={false}
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
        </Flex>

        <InsertionMarker index={index + 1} />
      </Table.ColumnHeaderCell>
    );
  }

  function InsertionMarker({ index }: { index: number }) {
    const marker = useRef<HTMLDivElement>(null);

    useEffect(() => {
      insertionMarkers.push({
        element: marker.current!,
        index,
      });

      return () => {
        insertionMarkers.splice(
          insertionMarkers.findIndex(
            (insertionMarker) => insertionMarker.element === marker.current!,
          ),
          1,
        );
      };
    });

    return (
      <div
        ref={marker}
        style={{
          height: '75%',
          width: 2,
          borderRadius: 1,
          backgroundColor: theme.colors.textLowContrast_crimson,
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          opacity: 0,
        }}
      />
    );
  }

  return (
    <PageWrapper color="crimson" size="100%">
      <Flex justify="center" gap="4" align="center" mt="4" direction="column">
        {(haveReactive || haveDynamicArmor || haveSpallLiner) && (
          <Callout.Root>
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              Consumables like Reactive Armor and Dynamic Armor System and
              provisions like Spall Liner may reduce other tanks' damage.
            </Callout.Text>
          </Callout.Root>
        )}

        <Flex gap="2" wrap="wrap" justify="center">
          <Dialog.Root
            open={addTankDialogOpen}
            onOpenChange={setAddTankDialogOpen}
          >
            <Dialog.Trigger>
              <Button variant="soft">
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
      </Flex>

      {members.length > 0 && (
        <Flex justify="center">
          <Table.Root variant="surface" style={{ maxWidth: '100%' }}>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell
                  width="0"
                  style={{
                    position: 'relative',
                  }}
                >
                  <Flex
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                    align="center"
                    justify="center"
                  >
                    <BlitzkitButtonWatermark width={64} height={64} />
                    <InsertionMarker index={0} />
                  </Flex>
                </Table.ColumnHeaderCell>

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
                                          : permanentSkills.includes(skill)
                                            ? theme.colors
                                                .textLowContrast_crimson
                                            : theme.colors
                                                .textLowContrast_amber,
                                    }}
                                  />
                                ))}
                              </Flex>
                            ))}
                          </Flex>
                        </Button>
                      </Popover.Trigger>

                      <Popover.Content>
                        <CrewSkillManager
                          skillLevels={crewSkills}
                          onChange={(skills) => {
                            mutateCompareTemporary((draft) => {
                              draft.crewSkills = skills;
                            });
                          }}
                        />

                        <Flex justify="end" mt="4" gap="4">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              mutateCompareTemporary((draft) => {
                                Object.keys(draft.crewSkills).forEach(
                                  (skill) => {
                                    draft.crewSkills[skill] = 0;
                                  },
                                );
                              });
                            }}
                          >
                            Clear
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              mutateCompareTemporary((draft) => {
                                Object.keys(draft.crewSkills).forEach(
                                  (skill) => {
                                    draft.crewSkills[skill] = 7;
                                  },
                                );
                              });
                            }}
                          >
                            Maximize
                          </Button>
                        </Flex>
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

                          <Flex mt="1">
                            {gun.shells.map((thisShell, shellIndex) => (
                              <IconButton
                                color={
                                  thisShell.id === shell.id ? undefined : 'gray'
                                }
                                variant="soft"
                                key={thisShell.id}
                                style={{
                                  borderTopLeftRadius:
                                    shellIndex === 0 ? undefined : 0,
                                  borderBottomLeftRadius:
                                    shellIndex === 0 ? undefined : 0,
                                  borderTopRightRadius:
                                    shellIndex === gun.shells.length - 1
                                      ? undefined
                                      : 0,
                                  borderBottomRightRadius:
                                    shellIndex === gun.shells.length - 1
                                      ? undefined
                                      : 0,
                                  marginLeft: shellIndex === 0 ? 0 : -1,
                                }}
                                onClick={() => {
                                  mutateCompareTemporary((draft) => {
                                    draft.members[index].shell = thisShell;
                                  });
                                }}
                              >
                                <img
                                  width={16}
                                  height={16}
                                  src={asset(
                                    `icons/shells/${thisShell.icon}.webp`,
                                  )}
                                />
                              </IconButton>
                            ))}
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
                <>
                  <Row
                    name="Intra-clip"
                    deltaType="lowerIsBetter"
                    value="intraClip"
                    decimals={2}
                  />
                  <Row name="Shells" value="shells" decimals={0} />
                </>
              )}
              <Row name="Penetration" value="penetration" decimals={0} />
              <Row name="Damage" value="damage" decimals={0} />
              <Row name="Module damage" value="moduleDamage" decimals={0} />
              <Row name="Caliber" value="caliber" decimals={0} />
              <Row
                name="Normalization"
                value="shellNormalization"
                decimals={0}
              />
              <Row
                name="Ricochet"
                value="shellRicochet"
                deltaType="lowerIsBetter"
                decimals={0}
              />
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
              <Row name="Weight" value="weight" decimals={1} />
              <Row
                name="Power to weight ratio on hard terrain"
                value="powerToWeightRatioHardTerrain"
                decimals={1}
              />
              <Row
                name="Power to weight ratio on medium terrain"
                value="powerToWeightRatioMediumTerrain"
                decimals={1}
              />
              <Row
                name="Power to weight ratio on soft terrain"
                value="powerToWeightRatioSoftTerrain"
                decimals={1}
              />
              <Row
                name="Turret traverse speed"
                value="turretTraverseSpeed"
                decimals={1}
              />
              <Row
                name="Traverse speed on hard terrain"
                value="hullTraverseHardTerrain"
                decimals={1}
              />
              <Row
                name="Traverse speed on medium terrain"
                value="hullTraverseMediumTerrain"
                decimals={1}
              />
              <Row
                name="Traverse speed on soft terrain"
                value="hullTraverseSoftTerrain"
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
