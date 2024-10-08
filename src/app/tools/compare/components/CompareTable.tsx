import { ComponentPlaceholderIcon } from '@radix-ui/react-icons';
import { Button, Flex, Popover, Slider, Table, Text } from '@radix-ui/themes';
import { debounce, times } from 'lodash';
import { use } from 'react';
import { ConsumablesManager } from '../../../../components/ConsumablesManager';
import { CrewSkillManager } from '../../../../components/CrewSkillManager';
import { EquipmentManager } from '../../../../components/EquipmentManager';
import { ModuleManager } from '../../../../components/ModuleManager';
import { ProvisionsManager } from '../../../../components/ProvisionsManager';
import { StickyColumnHeaderCell } from '../../../../components/StickyColumnHeaderCell';
import { StickyTableRoot } from '../../../../components/StickyTableRoot';
import { asset } from '../../../../core/blitzkit/asset';
import { availableProvisions } from '../../../../core/blitzkit/availableProvisions';
import { checkConsumableProvisionInclusivity } from '../../../../core/blitzkit/checkConsumableProvisionInclusivity';
import { consumableDefinitions } from '../../../../core/blitzkit/consumableDefinitions';
import { equipmentDefinitions } from '../../../../core/blitzkit/equipmentDefinitions';
import { provisionDefinitions } from '../../../../core/blitzkit/provisionDefinitions';
import { skillDefinitions } from '../../../../core/blitzkit/skillDefinitions';
import { TankCharacteristics } from '../../../../core/blitzkit/tankCharacteristics';
import { BlitzkitButtonGray } from '../../../../icons/BlitzkitButtonGray';
import { theme } from '../../../../stitches.config';
import * as CompareEphemeral from '../../../../stores/compareEphemeral';
import { EquipmentMatrix } from '../../../../stores/duel';
import { permanentSkills } from '../../tankopedia/[id]/components/Characteristics/components/Skills/constants';
import { Body } from './Body';
import { InsertionMarker } from './IntersectionMarker';
import { TankCard } from './TankCard';

interface CompareTableProps {
  stats: TankCharacteristics[];
}

export function CompareTable({ stats }: CompareTableProps) {
  const crewSkills = CompareEphemeral.use((state) => state.crewSkills);
  const members = CompareEphemeral.use((state) => state.members);
  const awaitedSkillDefinitions = use(skillDefinitions);
  const mutateCompareEphemeral = CompareEphemeral.useMutation();
  const awaitedEquipmentDefinitions = use(equipmentDefinitions);
  const awaitedConsumableDefinitions = use(consumableDefinitions);
  const awaitedProvisionDefinitions = use(provisionDefinitions);

  return (
    <StickyTableRoot
      size="1"
      variant="surface"
      style={{ maxWidth: '100%', height: 'calc(100vh - 128px)' }}
    >
      <Table.Header>
        <Table.Row>
          <StickyColumnHeaderCell width="0" style={{ height: '100%' }}>
            <Flex
              style={{
                width: '100%',
                height: '100%',
              }}
              align="center"
              justify="center"
            >
              <BlitzkitButtonGray opacity="0.25" width={64} height={64} />
              <InsertionMarker index={0} />
            </Flex>
          </StickyColumnHeaderCell>

          {members.map(({ tank, key }, index) => {
            return <TankCard index={index} key={key} tank={tank} />;
          })}
        </Table.Row>
      </Table.Header>

      <Table.Body>
        <Table.Row>
          <Table.Cell style={{ height: '100%' }}>
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
                      {Object.entries(awaitedSkillDefinitions.classes).map(
                        ([tankClass, skills]) => (
                          <Flex key={tankClass} style={{ gap: 2 }}>
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
                                        ? theme.colors.textLowContrast_crimson
                                        : theme.colors.textLowContrast_amber,
                                }}
                              />
                            ))}
                          </Flex>
                        ),
                      )}
                    </Flex>
                  </Button>
                </Popover.Trigger>

                <Popover.Content>
                  <CrewSkillManager
                    skillLevels={crewSkills}
                    onChange={(skills) => {
                      mutateCompareEphemeral((draft) => {
                        draft.crewSkills = skills;
                      });
                    }}
                  />

                  <Flex justify="end" mt="4" gap="4">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        mutateCompareEphemeral((draft) => {
                          Object.keys(draft.crewSkills).forEach((skill) => {
                            draft.crewSkills[skill] = 0;
                          });
                        });
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        mutateCompareEphemeral((draft) => {
                          Object.keys(draft.crewSkills).forEach((skill) => {
                            draft.crewSkills[skill] = 7;
                          });
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
                crewMastery,
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
                checkConsumableProvisionInclusivity(consumable, tank, gun),
              );

              return (
                <Table.Cell key={key}>
                  <Flex
                    align="center"
                    justify="center"
                    direction="column"
                    gap="2"
                  >
                    <Popover.Root>
                      <Popover.Trigger>
                        <Button variant="ghost">
                          <Flex align="center">
                            {(
                              ['turret', 'gun', 'engine', 'chassis'] as const
                            ).map((module, index) => (
                              <img
                                alt={module}
                                width={24}
                                height={24}
                                src={asset(`icons/modules/${module}.webp`)}
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
                            mutateCompareEphemeral((draft) => {
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
                              mutateCompareEphemeral((draft) => {
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
                              mutateCompareEphemeral((draft) => {
                                const member = draft.members[index];

                                member.turret = member.tank.turrets.at(-1)!;
                                member.gun = member.turret.guns.at(-1)!;
                                member.shell = member.gun.shells[0];
                                member.engine = member.tank.engines.at(-1)!;
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
                                  alt={
                                    awaitedProvisionDefinitions[provision].name
                                  }
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
                            disabled={tank.provisions === provisions.length}
                            onChange={(provisions) => {
                              mutateCompareEphemeral((draft) => {
                                draft.members[index].provisions = provisions;
                              });
                            }}
                          />

                          <Flex justify="end" mt="4">
                            <Button
                              variant="ghost"
                              onClick={() => {
                                mutateCompareEphemeral((draft) => {
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
                                    const equipment = equipmentMatrix[y][x];

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
                                                : theme.colors.textLowContrast,
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
                                                : theme.colors.textLowContrast,
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
                              mutateCompareEphemeral((draft) => {
                                draft.members[index].equipmentMatrix = matrix;
                                draft.sorting = undefined;
                              });
                            }}
                          />

                          <Flex justify="end" gap="4" mt="4">
                            <Button
                              variant="ghost"
                              color="red"
                              onClick={() => {
                                mutateCompareEphemeral((draft) => {
                                  draft.members[index].equipmentMatrix = times(
                                    3,
                                    () => times(3, () => 0),
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
                                mutateCompareEphemeral((draft) => {
                                  draft.members.forEach((member) => {
                                    member.equipmentMatrix =
                                      draft.members[index].equipmentMatrix;
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
                                  alt={
                                    awaitedConsumableDefinitions[consumable]
                                      .name
                                  }
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
                            onConsumablesChange={(consumables) => {
                              mutateCompareEphemeral((draft) => {
                                draft.members[index].consumables = consumables;
                              });
                            }}
                            disabled={tank.consumables === consumables.length}
                          />

                          <Flex justify="end" mt="4">
                            <Button
                              variant="ghost"
                              onClick={() => {
                                mutateCompareEphemeral((draft) => {
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

                    <Flex gap="2" width="100%" align="center">
                      <Text>{Math.round(crewMastery * 100)}%</Text>
                      <Flex flexGrow="1">
                        <Slider
                          defaultValue={[crewMastery]}
                          min={0.5}
                          max={1}
                          step={1 / 100}
                          onValueChange={debounce(([value]: number[]) => {
                            mutateCompareEphemeral((draft) => {
                              draft.members[index].crewMastery = value;
                            });
                          }, 500)}
                        />
                      </Flex>
                    </Flex>
                  </Flex>
                </Table.Cell>
              );
            },
          )}
        </Table.Row>
      </Table.Body>

      <Body stats={stats} />
    </StickyTableRoot>
  );
}
