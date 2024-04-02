import { Cross1Icon, ShuffleIcon } from '@radix-ui/react-icons';
import { Button, Card, Dialog, Flex, Heading, Tabs } from '@radix-ui/themes';
import { useState } from 'react';
import { ModuleButton } from '../../../../../components/ModuleButtons/ModuleButton';
import { ShellButton } from '../../../../../components/ModuleButtons/ShellButton';
import { SmallTankIcon } from '../../../../../components/SmallTankIcon';
import { resolveNearPenetration } from '../../../../../core/blitz/resolveNearPenetration';
import { pushTankopediaPath } from '../../../../../core/blitzkrieg/pushTankopediaPath';
import {
  SHELL_NAMES,
  TIER_ROMAN_NUMERALS,
} from '../../../../../core/blitzkrieg/tankDefinitions/constants';
import { mutateDuel, useDuel } from '../../../../../stores/duel';
import {
  mutateTankopediaTemporary,
  useTankopediaPersistent,
} from '../../../../../stores/tankopedia';
import { TankSearch } from '../../components/TankSearch';

interface AntagonistBarProps {
  floating?: boolean;
}

export function AntagonistBar({ floating }: AntagonistBarProps) {
  const antagonist = useDuel((state) => state.antagonist!);
  const mode = useTankopediaPersistent((state) => state.mode);
  const [tab, setTab] = useState('search');
  const [antagonistSelectorOpen, setAntagonistSelectorVisible] =
    useState(false);

  if (mode !== 'armor') return null;

  return (
    <Flex justify="center">
      <Card
        style={
          floating
            ? {
                position: 'absolute',
                bottom: 8,
                left: '50%',
                transform: 'translateX(-50%)',
              }
            : undefined
        }
      >
        <Flex
          align="center"
          justify="center"
          wrap="wrap"
          style={{
            gap: 'min(5vw, 32px)',
          }}
        >
          <Flex>
            {antagonist.gun.shells.map((shell, index) => {
              return (
                <ShellButton
                  selected={antagonist.shell.id === shell.id}
                  shell={shell.icon}
                  rowChild
                  first={index === 0}
                  key={shell.id}
                  last={index === antagonist.gun.shells.length - 1}
                  onClick={() => {
                    mutateDuel((draft) => {
                      draft.antagonist!.shell = shell;
                      mutateTankopediaTemporary((draft) => {
                        draft.shot = undefined;
                      });
                    });
                  }}
                />
              );
            })}
          </Flex>

          <Button
            variant="ghost"
            onClick={() => {
              mutateDuel((draft) => {
                [draft.protagonist, draft.antagonist] = [
                  draft.antagonist,
                  draft.protagonist,
                ];
                pushTankopediaPath(draft.antagonist!.tank.id);
              });
            }}
          >
            <ShuffleIcon /> Swap
          </Button>

          <Flex align="center" gap="4">
            <Dialog.Root
              open={antagonistSelectorOpen}
              onOpenChange={setAntagonistSelectorVisible}
            >
              <Dialog.Trigger>
                <Button variant="ghost">
                  <Flex gap="2" align="center">
                    Versus {antagonist.tank.name}
                    <SmallTankIcon id={antagonist.tank.id} size={16} />
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
                            setAntagonistSelectorVisible(false);
                          }}
                        />
                      </Flex>
                    </Tabs.Content>

                    <Tabs.Content value="configure">
                      <Flex direction="column" gap="4">
                        <Flex direction="column" gap="2" style={{ flex: 1 }}>
                          <Heading size="4">
                            {antagonist.tank.name} modules
                          </Heading>

                          <Flex gap="2" wrap="wrap">
                            <Flex>
                              {antagonist.tank.turrets.map((turret, index) => (
                                <ModuleButton
                                  rowChild
                                  first={index === 0}
                                  last={
                                    index === antagonist.tank.turrets.length - 1
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
                                    mutateTankopediaTemporary((draft) => {
                                      draft.shot = undefined;
                                    });
                                  }}
                                  selected={antagonist.turret.id === turret.id}
                                  discriminator={
                                    TIER_ROMAN_NUMERALS[turret.tier]
                                  }
                                  module="turret"
                                />
                              ))}
                            </Flex>
                            <Flex>
                              {antagonist.turret.guns.map((gun, index) => (
                                <ModuleButton
                                  rowChild
                                  first={index === 0}
                                  last={
                                    index === antagonist.turret.guns.length - 1
                                  }
                                  onClick={() => {
                                    mutateDuel((draft) => {
                                      draft.antagonist!.gun = gun;
                                      draft.antagonist!.shell = gun.shells[0];
                                    });
                                  }}
                                  selected={antagonist.gun.id === gun.id}
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
                              Turret: <b>{antagonist.turret.name}</b>
                            </li>
                            <li>
                              Gun: <b>{antagonist.gun.name}</b>
                            </li>
                            <li>Shells:</li>
                            <ul>
                              {antagonist.gun.shells.map((shell) => (
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
        </Flex>
      </Card>
    </Flex>
  );
}
