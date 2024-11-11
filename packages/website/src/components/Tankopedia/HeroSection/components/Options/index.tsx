import {
  asset,
  imgur,
  resolvePenetrationCoefficient,
  TIER_ROMAN_NUMERALS,
  uniqueGuns,
} from '@blitzkit/core';
import {
  CameraIcon,
  CopyIcon,
  DownloadIcon,
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  EyeOpenIcon,
  GearIcon,
} from '@radix-ui/react-icons';
import {
  Button,
  Dialog,
  DropdownMenu,
  Flex,
  IconButton,
  Popover,
  SegmentedControl,
  Tabs,
  Text,
  Tooltip,
} from '@radix-ui/themes';
import { invalidate } from '@react-three/fiber';
import { useState, type RefObject } from 'react';
import { ENVIRONMENTS } from '../../../../../constants/lightingEnvironments';
import { Pose, poseEvent } from '../../../../../core/blitzkit/pose';
import { useEquipment } from '../../../../../hooks/useEquipment';
import { useFullScreen } from '../../../../../hooks/useFullScreen';
import { useFullscreenAvailability } from '../../../../../hooks/useFullscreenAvailability';
import { App } from '../../../../../stores/app';
import { Duel } from '../../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../../stores/tankopediaEphemeral';
import { TankopediaPersistent } from '../../../../../stores/tankopediaPersistent';
import { TankopediaDisplay } from '../../../../../stores/tankopediaPersistent/constants';
import type { ThicknessRange } from '../../../../Armor/components/StaticArmor';
import { ModuleButton } from '../../../../ModuleButtons/ModuleButton';
import { SmallTankIcon } from '../../../../SmallTankIcon';
import { TankSearch } from '../../../../TankSearch';
import { CustomShellButton } from './components/CustomShellButton';
import { DynamicArmorSwitcher } from './components/DynamicArmorSwitcher';
import { QuickInputs } from './components/QuickInputs';
import { Thicknesses } from './components/Thicknesses';

interface OptionsProps {
  thicknessRange: ThicknessRange;
  canvas: RefObject<HTMLCanvasElement>;
}

export function Options({ thicknessRange, canvas }: OptionsProps) {
  const hasCustomShell = TankopediaEphemeral.use(
    (state) => state.customShell !== undefined,
  );
  const display = TankopediaPersistent.useDeferred(
    (state) => state.display,
    TankopediaDisplay.Model,
  );
  const isFullScreen = useFullScreen();
  const showGrid = TankopediaPersistent.use((state) => state.showGrid);
  const showEnvironment = TankopediaPersistent.use(
    (state) => state.showEnvironment,
  );
  const greenPenetration = TankopediaPersistent.use(
    (state) => state.greenPenetration,
  );
  const wireframe = TankopediaPersistent.use((state) => state.wireframe);
  const opaque = TankopediaPersistent.use((state) => state.opaque);
  const fullScreenAvailable = useFullscreenAvailability();
  const environment = TankopediaPersistent.use((state) => state.environment);
  const developerMode = App.use((state) => state.developerMode);
  const protagonistTank = Duel.use((state) => state.protagonist.tank);
  const antagonistGun = Duel.use((state) => state.antagonist.gun);
  const antagonistShell = Duel.use((state) => state.antagonist.shell);
  const [antagonistSelectorOpen, setAntagonistSelectorOpen] = useState(false);
  const antagonistTank = Duel.use((state) => state.antagonist.tank);
  const hasCalibratedShells = useEquipment(103, true);
  const [tab, setTab] = useState('search');
  const mutateDuel = Duel.useMutation();
  const hasEnhancedArmor = useEquipment(110);
  const antagonistUniqueGuns = uniqueGuns(antagonistTank.turrets);
  const mutateTankopediaPersistent = TankopediaPersistent.useMutation();
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();

  return (
    <>
      <QuickInputs />

      {display === TankopediaDisplay.StaticArmor && (
        <Thicknesses thicknessRange={thicknessRange} />
      )}

      {display === TankopediaDisplay.DynamicArmor && (
        <Flex
          gap="2"
          direction="column"
          top="50%"
          right="3"
          style={{ position: 'absolute', transform: 'translateY(-50%)' }}
          align="end"
        >
          {!hasCustomShell && (
            <Text color="gray" size={{ initial: '1', sm: '2' }}>
              {(
                resolvePenetrationCoefficient(
                  hasCalibratedShells,
                  antagonistShell.type,
                ) * antagonistShell.penetration.near
              ).toFixed(0)}
              mm
            </Text>
          )}
          {antagonistUniqueGuns.length > 1 && (
            <Popover.Root>
              <Popover.Trigger>
                <IconButton
                  radius="full"
                  variant="soft"
                  color="gray"
                  size={{ initial: '2', sm: '3' }}
                  style={{ position: 'relative' }}
                >
                  <Text
                    size="1"
                    color="gray"
                    style={{
                      position: 'absolute',
                      right: 0,
                      bottom: 0,
                    }}
                    mr="2"
                    mb="1"
                  >
                    {
                      TIER_ROMAN_NUMERALS[
                        antagonistGun.gun_type!.value.base.tier
                      ]
                    }
                  </Text>

                  <img
                    alt="Antagonist Gun"
                    src={asset('icons/modules/gun.webp')}
                    style={{
                      width: '65%',
                      height: '65%',
                      objectFit: 'contain',
                    }}
                  />
                </IconButton>
              </Popover.Trigger>

              <Popover.Content side="left" align="center">
                <Flex gap="2">
                  {[...antagonistUniqueGuns]
                    .reverse()
                    .map(({ gun, turret }) => (
                      <ModuleButton
                        module="gun"
                        key={gun.gun_type!.value.base.id}
                        onClick={() =>
                          mutateDuel((draft) => {
                            draft.antagonist.turret = turret;
                            draft.antagonist.gun = gun;
                            draft.antagonist.shell =
                              gun.gun_type!.value.base.shells[0];
                          })
                        }
                        selected={
                          gun.gun_type!.value.base.id ===
                          antagonistGun.gun_type!.value.base.id
                        }
                        discriminator={
                          TIER_ROMAN_NUMERALS[gun.gun_type!.value.base.tier]
                        }
                      />
                    ))}
                </Flex>
              </Popover.Content>
            </Popover.Root>
          )}
          <Flex
            direction="column"
            style={{
              borderRadius: 'var(--radius-full)',
            }}
            overflow="hidden"
          >
            {antagonistGun.gun_type!.value.base.shells.map((thisShell) => (
              <IconButton
                color={
                  thisShell.id === antagonistShell.id && !hasCustomShell
                    ? undefined
                    : 'gray'
                }
                variant="soft"
                key={thisShell.id}
                size={{ initial: '2', sm: '3' }}
                radius="none"
                onClick={() => {
                  invalidate();
                  mutateDuel((draft) => {
                    draft.antagonist.shell = thisShell;
                  });
                  mutateTankopediaEphemeral((draft) => {
                    draft.shot = undefined;
                    draft.customShell = undefined;
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

            <CustomShellButton />
          </Flex>

          <Flex
            direction="column"
            style={{
              pointerEvents: 'auto',
              borderRadius: 'var(--radius-full)',
            }}
            overflow="hidden"
          >
            <IconButton
              color={hasCalibratedShells ? undefined : 'gray'}
              variant="soft"
              size={{ initial: '2', sm: '3' }}
              radius="none"
              onClick={() => {
                invalidate();
                mutateDuel((draft) => {
                  draft.antagonist.equipmentMatrix[0][0] = hasCalibratedShells
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
              size={{ initial: '2', sm: '3' }}
              radius="none"
              onClick={() => {
                invalidate();
                mutateDuel((draft) => {
                  draft.protagonist.equipmentMatrix[1][1] = hasEnhancedArmor
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

          <DynamicArmorSwitcher />
        </Flex>
      )}

      <Flex
        direction="column"
        align="center"
        position="absolute"
        bottom="4"
        left="50%"
        style={{ transform: 'translateX(-50%)' }}
      >
        {display === TankopediaDisplay.DynamicArmor && (
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
                <Dialog.Title align="center">Select tank</Dialog.Title>

                <Tabs.Root
                  value={tab}
                  onValueChange={setTab}
                  style={{ position: 'relative' }}
                >
                  <TankSearch
                    compact
                    onSelect={(tank) => {
                      mutateDuel((draft) => {
                        draft.antagonist.tank = tank;
                        draft.antagonist.engine = tank.engines.at(-1)!;
                        draft.antagonist.track = tank.tracks.at(-1)!;
                        draft.antagonist.turret = tank.turrets.at(-1)!;
                        draft.antagonist.gun =
                          draft.antagonist.turret.guns.at(-1)!;
                        draft.antagonist.shell =
                          draft.antagonist.gun.gun_type!.value.base.shells[0];
                      });
                      setAntagonistSelectorOpen(false);
                    }}
                  />
                </Tabs.Root>
              </Dialog.Content>
            </Dialog.Root>
          </Flex>
        )}

        <Flex gap="3" align="center" mt="2">
          <SegmentedControl.Root
            value={`${display}`}
            onValueChange={(value) => {
              mutateTankopediaPersistent((draft) => {
                draft.display = Number(value);
              });
            }}
          >
            <SegmentedControl.Item value={`${TankopediaDisplay.Model}`}>
              <Tooltip content="Model">
                <Flex height="100%" align="center">
                  <img src={imgur('jAdYf0m')} style={{ height: '1.25em' }} />
                </Flex>
              </Tooltip>
            </SegmentedControl.Item>
            <SegmentedControl.Item value={`${TankopediaDisplay.DynamicArmor}`}>
              <Tooltip content="Dynamic armor">
                <Flex height="100%" align="center">
                  <img src={imgur('oe4Cq0g')} style={{ height: '1.25em' }} />
                </Flex>
              </Tooltip>
            </SegmentedControl.Item>
            <SegmentedControl.Item value={`${TankopediaDisplay.StaticArmor}`}>
              <Tooltip content="Static armor">
                <Flex height="100%" align="center">
                  <img src={imgur('VQ4uDno')} style={{ height: '1.25em' }} />
                </Flex>
              </Tooltip>
            </SegmentedControl.Item>
          </SegmentedControl.Root>

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
              {display === TankopediaDisplay.DynamicArmor && (
                <>
                  <DropdownMenu.Label>Armor</DropdownMenu.Label>

                  <DropdownMenu.CheckboxItem
                    checked={greenPenetration}
                    onCheckedChange={(checked) => {
                      mutateTankopediaPersistent((draft) => {
                        draft.greenPenetration = checked;
                      });
                    }}
                  >
                    Green penetration
                  </DropdownMenu.CheckboxItem>

                  <DropdownMenu.CheckboxItem
                    checked={opaque}
                    onCheckedChange={(checked) => {
                      mutateTankopediaPersistent((draft) => {
                        draft.opaque = checked;
                      });
                    }}
                  >
                    Opaque
                  </DropdownMenu.CheckboxItem>

                  {developerMode && (
                    <DropdownMenu.CheckboxItem
                      checked={wireframe}
                      onCheckedChange={(checked) => {
                        mutateTankopediaPersistent((draft) => {
                          draft.wireframe = checked;
                        });
                      }}
                    >
                      <b>DEV:</b> Wireframe
                    </DropdownMenu.CheckboxItem>
                  )}
                </>
              )}

              <DropdownMenu.Label>Environment</DropdownMenu.Label>

              <DropdownMenu.CheckboxItem
                checked={showGrid}
                onCheckedChange={(checked) => {
                  mutateTankopediaPersistent((draft) => {
                    draft.showGrid = checked;
                  });
                }}
              >
                Show grid
              </DropdownMenu.CheckboxItem>

              <DropdownMenu.CheckboxItem
                checked={showEnvironment}
                onCheckedChange={(checked) => {
                  mutateTankopediaPersistent((draft) => {
                    draft.showEnvironment = checked;
                  });
                }}
              >
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
                            draft.environment = environment;
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

          <Popover.Root>
            <Popover.Trigger>
              <IconButton color="gray" variant="ghost">
                <CameraIcon />
              </IconButton>
            </Popover.Trigger>

            <Popover.Content>
              <Flex direction="column" gap="2">
                <Popover.Close>
                  <Button
                    onClick={() => {
                      if (!canvas.current) return;

                      const anchor = document.createElement('a');

                      anchor.setAttribute(
                        'download',
                        `${protagonistTank.name}.png`,
                      );
                      anchor.setAttribute(
                        'href',
                        canvas.current.toDataURL('image/png'),
                      );
                      anchor.click();
                    }}
                  >
                    <DownloadIcon />
                    Download
                  </Button>
                </Popover.Close>
                <Popover.Close>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!canvas.current) return;

                      canvas.current.toBlob((blob) => {
                        if (!blob) return;

                        navigator.clipboard.write([
                          new ClipboardItem({ 'image/png': blob }),
                        ]);
                      });
                    }}
                  >
                    <CopyIcon />
                    Copy
                  </Button>
                </Popover.Close>
              </Flex>
            </Popover.Content>
          </Popover.Root>

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
