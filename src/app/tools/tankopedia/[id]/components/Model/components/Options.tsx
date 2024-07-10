import {
  Cross1Icon,
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  EyeOpenIcon,
  GearIcon,
} from '@radix-ui/react-icons';
import {
  Box,
  Button,
  Dialog,
  DropdownMenu,
  Flex,
  Heading,
  IconButton,
  Strong,
  Switch,
  Tabs,
  Text,
} from '@radix-ui/themes';
import { useState } from 'react';
import { ModuleButton } from '../../../../../../../components/ModuleButtons/ModuleButton';
import { SmallTankIcon } from '../../../../../../../components/SmallTankIcon';
import { resolveNearPenetration } from '../../../../../../../core/blitz/resolveNearPenetration';
import { resolvePenetrationCoefficient } from '../../../../../../../core/blitz/resolvePenetrationCoefficient';
import { asset } from '../../../../../../../core/blitzkit/asset';
import { Pose, poseEvent } from '../../../../../../../core/blitzkit/pose';
import {
  SHELL_NAMES,
  TIER_ROMAN_NUMERALS,
} from '../../../../../../../core/blitzkit/tankDefinitions/constants';
import { useEquipment } from '../../../../../../../hooks/useEquipment';
import { useFullScreen } from '../../../../../../../hooks/useFullScreen';
import * as App from '../../../../../../../stores/app';
import { mutateDuel, useDuel } from '../../../../../../../stores/duel';
import * as TankopediaEphemeral from '../../../../../../../stores/tankopediaEphemeral';
import * as TankopediaPersistent from '../../../../../../../stores/tankopediaPersistent';
import { TankSearch } from '../../../../components/TankSearch';
import { ENVIRONMENTS } from '../../Lighting';
import { RotationInputs } from '../../QuickInputs';

export function Options() {
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();
  const mutateTankopediaPersistent = TankopediaPersistent.useMutation();
  const mode = TankopediaPersistent.use((state) => state.mode);
  const isFullScreen = useFullScreen();
  const showGrid = TankopediaPersistent.use(
    (state) => state.model.visual.showGrid,
  );
  const showEnvironment = TankopediaPersistent.use(
    (state) => state.model.visual.showEnvironment,
  );
  const greenPenetration = TankopediaPersistent.use(
    (state) => state.model.visual.greenPenetration,
  );
  const wireframe = TankopediaPersistent.use(
    (state) => state.model.visual.wireframe,
  );
  const showSpacedArmor = TankopediaPersistent.use(
    (state) => state.model.visual.showSpacedArmor,
  );
  const opaque = TankopediaPersistent.use((state) => state.model.visual.opaque);
  const fullScreenAvailable =
    typeof document !== 'undefined' && document.fullscreenEnabled;
  const environment = TankopediaPersistent.use(
    (state) => state.model.visual.environment,
  );
  const developerMode = App.use((state) => state.developerMode);
  const antagonistGun = useDuel((state) => state.antagonist!.gun);
  const antagonistShell = useDuel((state) => state.antagonist!.shell);
  const [antagonistSelectorOpen, setAntagonistSelectorOpen] = useState(false);
  const antagonistTank = useDuel((state) => state.antagonist!.tank);
  const antagonistTurret = useDuel((state) => state.antagonist!.turret);
  const hasCalibratedShells = useEquipment(103, true);
  const [tab, setTab] = useState('search');
  const hasEnhancedArmor = useEquipment(110);

  return (
    <>
      {isFullScreen && (
        <Box
          pl="4"
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          <Text
            size={{
              initial: '3',
              xs: '5',
            }}
            color="gray"
            style={{
              writingMode: 'vertical-lr',
            }}
          >
            <Strong>BlitzKit</Strong> Tankopedia
          </Text>
        </Box>
      )}

      <RotationInputs />

      {mode === 'armor' && (
        <Flex
          gap="2"
          direction="column"
          style={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
          align="end"
        >
          <Text color="gray" size={{ initial: '1', sm: '2' }}>
            {(
              resolvePenetrationCoefficient(
                hasCalibratedShells,
                antagonistShell.type,
              ) * resolveNearPenetration(antagonistShell.penetration)
            ).toFixed(0)}
            mm
          </Text>
          <Flex direction="column">
            {antagonistGun.shells.map((thisShell, shellIndex) => (
              <IconButton
                color={thisShell.id === antagonistShell.id ? undefined : 'gray'}
                variant="soft"
                key={thisShell.id}
                size={{
                  initial: '2',
                  sm: '3',
                }}
                style={{
                  borderTopLeftRadius: shellIndex === 0 ? undefined : 0,
                  borderTopRightRadius: shellIndex === 0 ? undefined : 0,
                  borderBottomRightRadius:
                    shellIndex === antagonistGun.shells.length - 1
                      ? undefined
                      : 0,
                  borderBottomLeftRadius:
                    shellIndex === antagonistGun.shells.length - 1
                      ? undefined
                      : 0,
                  marginTop: shellIndex === 0 ? 0 : -1,
                }}
                onClick={() => {
                  mutateDuel((draft) => {
                    draft.antagonist!.shell = thisShell;
                  });
                  mutateTankopediaEphemeral((draft) => {
                    draft.shot = undefined;
                  });
                }}
              >
                <img
                  alt={thisShell.name}
                  src={asset(`icons/shells/${thisShell.icon}.webp`)}
                  style={{
                    width: '50%',
                    height: '50%',
                  }}
                />
              </IconButton>
            ))}
          </Flex>
          <Flex direction="column" style={{ pointerEvents: 'auto' }}>
            <IconButton
              color={hasCalibratedShells ? undefined : 'gray'}
              variant="soft"
              style={{
                borderBottomRightRadius: 0,
                borderBottomLeftRadius: 0,
              }}
              size={{
                initial: '2',
                sm: '3',
              }}
              onClick={() => {
                mutateDuel((draft) => {
                  draft.antagonist!.equipmentMatrix[0][0] = hasCalibratedShells
                    ? 0
                    : 1;
                });
                mutateTankopediaEphemeral((draft) => {
                  draft.shot = undefined;
                });
              }}
            >
              <img
                alt="Calibrated Shells"
                src={asset('icons/equipment/103.webp')}
                style={{
                  width: '50%',
                  height: '50%',
                }}
              />
            </IconButton>
            <IconButton
              color={hasEnhancedArmor ? undefined : 'gray'}
              variant="soft"
              size={{
                initial: '2',
                sm: '3',
              }}
              style={{
                borderTopRightRadius: 0,
                borderTopLeftRadius: 0,
                marginTop: -1,
              }}
              onClick={() => {
                mutateDuel((draft) => {
                  draft.protagonist!.equipmentMatrix[1][1] = hasEnhancedArmor
                    ? 0
                    : -1;
                });
                mutateTankopediaEphemeral((draft) => {
                  draft.shot = undefined;
                });
              }}
            >
              <img
                alt="Enhanced Armor"
                src={asset('icons/equipment/110.webp')}
                style={{
                  width: '50%',
                  height: '50%',
                }}
              />
            </IconButton>
          </Flex>
        </Flex>
      )}

      <Flex
        style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
        direction="column"
        align="center"
        gap="2"
      >
        {mode === 'armor' && (
          <Flex align="center" gap="2">
            <Text color="gray" size="2">
              Shooter:
            </Text>
            <Dialog.Root
              open={antagonistSelectorOpen}
              onOpenChange={setAntagonistSelectorOpen}
            >
              <Dialog.Trigger>
                <Button variant="ghost">
                  <Flex gap="2" align="center">
                    <SmallTankIcon id={antagonistTank.id} size={16} />
                    {antagonistTank.name}
                  </Flex>
                </Button>
              </Dialog.Trigger>

              <Dialog.Content>
                <Tabs.Root
                  value={tab}
                  onValueChange={setTab}
                  style={{ position: 'relative' }}
                >
                  <Dialog.Close>
                    <Button
                      variant="ghost"
                      style={{ position: 'absolute', right: 0, top: 8 }}
                    >
                      <Cross1Icon />
                    </Button>
                  </Dialog.Close>

                  <Flex gap="4" direction="column">
                    <Tabs.List>
                      <Tabs.Trigger value="search">Search</Tabs.Trigger>
                      <Tabs.Trigger value="configure">Configure</Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content value="search">
                      <Flex
                        direction="column"
                        gap="4"
                        style={{ flex: 1 }}
                        justify="center"
                      >
                        <TankSearch
                          compact
                          onSelect={(tank) => {
                            mutateDuel((draft) => {
                              draft.antagonist!.tank = tank;
                              draft.antagonist!.engine = tank.engines.at(-1)!;
                              draft.antagonist!.track = tank.tracks.at(-1)!;
                              draft.antagonist!.turret = tank.turrets.at(-1)!;
                              draft.antagonist!.gun =
                                draft.antagonist!.turret.guns.at(-1)!;
                              draft.antagonist!.shell =
                                draft.antagonist!.gun.shells[0];
                            });
                            setAntagonistSelectorOpen(false);
                          }}
                        />
                      </Flex>
                    </Tabs.Content>

                    <Tabs.Content value="configure">
                      <Flex direction="column" gap="4">
                        <Flex direction="column" gap="2" style={{ flex: 1 }}>
                          <Heading size="4">
                            {antagonistTank.name} modules
                          </Heading>

                          <Flex gap="2" wrap="wrap">
                            <Flex>
                              {antagonistTank.turrets.map((turret, index) => (
                                <ModuleButton
                                  rowChild
                                  first={index === 0}
                                  last={
                                    index === antagonistTank.turrets.length - 1
                                  }
                                  key={turret.id}
                                  onClick={() => {
                                    mutateDuel((draft) => {
                                      draft.antagonist!.turret = turret;
                                      draft.antagonist!.gun =
                                        turret.guns.at(-1)!;
                                      draft.antagonist!.shell =
                                        draft.antagonist!.gun.shells[0];
                                    });
                                    mutateTankopediaEphemeral((draft) => {
                                      draft.shot = undefined;
                                    });
                                  }}
                                  selected={antagonistTurret.id === turret.id}
                                  discriminator={
                                    TIER_ROMAN_NUMERALS[turret.tier]
                                  }
                                  module="turret"
                                />
                              ))}
                            </Flex>
                            <Flex>
                              {antagonistTurret.guns.map((gun, index) => (
                                <ModuleButton
                                  key={gun.id}
                                  rowChild
                                  first={index === 0}
                                  last={
                                    index === antagonistTurret.guns.length - 1
                                  }
                                  onClick={() => {
                                    mutateDuel((draft) => {
                                      draft.antagonist!.gun = gun;
                                      draft.antagonist!.shell = gun.shells[0];
                                    });
                                  }}
                                  selected={antagonistGun.id === gun.id}
                                  discriminator={TIER_ROMAN_NUMERALS[gun.tier]}
                                  module="gun"
                                />
                              ))}
                            </Flex>
                          </Flex>
                        </Flex>

                        <Flex direction="column" style={{ flex: 1 }}>
                          <Heading size="4">Properties</Heading>

                          <ul>
                            <li>
                              Turret: <b>{antagonistTurret.name}</b>
                            </li>
                            <li>
                              Gun: <b>{antagonistGun.name}</b>
                            </li>
                            <li>Shells:</li>
                            <ul>
                              {antagonistGun.shells.map((shell) => (
                                <li key={shell.id}>
                                  {SHELL_NAMES[shell.type]}:{' '}
                                  <b>
                                    {resolveNearPenetration(shell.penetration)}
                                    mm
                                  </b>
                                  , {shell.damage.armor}HP
                                </li>
                              ))}
                            </ul>
                          </ul>
                        </Flex>
                      </Flex>
                    </Tabs.Content>
                  </Flex>
                </Tabs.Root>
              </Dialog.Content>
            </Dialog.Root>
          </Flex>
        )}

        <Flex gap="3" align="center">
          <Flex
            style={{
              cursor: 'default',
              userSelect: 'none',
            }}
            align="center"
            gap="2"
            onClick={() => {
              mutateTankopediaPersistent((draft) => {
                draft.mode = draft.mode === 'armor' ? 'model' : 'armor';
              });
            }}
            mr="1"
          >
            <Switch size="1" checked={mode === 'armor'} />
            Armor
          </Flex>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton variant="ghost" color="gray">
                <EyeOpenIcon />
              </IconButton>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content>
              <DropdownMenu.Item onClick={() => poseEvent.emit(Pose.HullDown)}>
                Hull down
              </DropdownMenu.Item>

              <DropdownMenu.Item onClick={() => poseEvent.emit(Pose.FaceHug)}>
                Face hug
              </DropdownMenu.Item>

              <DropdownMenu.Item onClick={() => poseEvent.emit(Pose.Default)}>
                Default
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton variant="ghost" color="gray">
                <GearIcon />
              </IconButton>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content>
              {mode === 'armor' && (
                <>
                  <DropdownMenu.Label>Armor</DropdownMenu.Label>

                  <DropdownMenu.CheckboxItem
                    checked={showSpacedArmor}
                    onCheckedChange={(checked) => {
                      mutateTankopediaPersistent((draft) => {
                        draft.model.visual.showSpacedArmor = checked;
                      });
                      mutateTankopediaEphemeral((draft) => {
                        draft.shot = undefined;
                      });
                    }}
                  >
                    Spaced armor
                  </DropdownMenu.CheckboxItem>

                  <DropdownMenu.CheckboxItem
                    checked={greenPenetration}
                    onCheckedChange={(checked) => {
                      mutateTankopediaPersistent((draft) => {
                        draft.model.visual.greenPenetration = checked;
                      });
                    }}
                  >
                    Green penetration
                  </DropdownMenu.CheckboxItem>

                  {developerMode && (
                    <DropdownMenu.CheckboxItem
                      checked={wireframe}
                      onCheckedChange={(checked) => {
                        mutateTankopediaPersistent((draft) => {
                          draft.model.visual.wireframe = checked;
                        });
                      }}
                    >
                      Wireframe
                    </DropdownMenu.CheckboxItem>
                  )}

                  <DropdownMenu.CheckboxItem
                    checked={opaque}
                    onCheckedChange={(checked) => {
                      mutateTankopediaPersistent((draft) => {
                        draft.model.visual.opaque = checked;
                      });
                    }}
                  >
                    Opaque
                  </DropdownMenu.CheckboxItem>
                </>
              )}

              <DropdownMenu.Label>Environment</DropdownMenu.Label>

              <DropdownMenu.CheckboxItem
                checked={showGrid}
                onCheckedChange={(checked) => {
                  mutateTankopediaPersistent((draft) => {
                    draft.model.visual.showGrid = checked;
                  });
                }}
              >
                Show grid
              </DropdownMenu.CheckboxItem>

              <DropdownMenu.CheckboxItem
                checked={showEnvironment}
                onCheckedChange={(checked) => {
                  mutateTankopediaPersistent((draft) => {
                    draft.model.visual.showEnvironment = checked;
                  });
                }}
              >
                {/* TODO: consider removing this? */}
                View environment
              </DropdownMenu.CheckboxItem>

              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger>Lighting</DropdownMenu.SubTrigger>

                <DropdownMenu.SubContent>
                  <DropdownMenu.RadioGroup value={environment}>
                    {ENVIRONMENTS.map((environment) => (
                      <DropdownMenu.RadioItem
                        key={environment}
                        value={environment}
                        onClick={() => {
                          mutateTankopediaPersistent((draft) => {
                            draft.model.visual.environment = environment;
                          });
                        }}
                      >
                        {environment[0].toUpperCase() + environment.slice(1)}
                      </DropdownMenu.RadioItem>
                    ))}
                  </DropdownMenu.RadioGroup>
                </DropdownMenu.SubContent>
              </DropdownMenu.Sub>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          {fullScreenAvailable && (
            <IconButton
              color="gray"
              variant="ghost"
              onClick={() => {
                if (isFullScreen) {
                  document.exitFullscreen();
                } else document.body.requestFullscreen();
              }}
            >
              {isFullScreen ? <ExitFullScreenIcon /> : <EnterFullScreenIcon />}
            </IconButton>
          )}
        </Flex>
      </Flex>
    </>
  );
}
