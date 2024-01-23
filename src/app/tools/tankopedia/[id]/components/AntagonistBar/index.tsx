import { CaretRightIcon, Cross1Icon, ShuffleIcon } from '@radix-ui/react-icons';
import {
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  Tabs,
  Text,
  Tooltip,
} from '@radix-ui/themes';
import { useState } from 'react';
import { ModuleButton } from '../../../../../../components/ModuleButton';
import { SmallTankIcon } from '../../../../../../components/SmallTankIcon';
import { resolveNearPenetration } from '../../../../../../core/blitz/resolveNearPenetration';
import { SHELL_NAMES } from '../../../../../../core/blitzkrieg/tankDefinitions';
import { mutateDuel, useDuel } from '../../../../../../stores/duel';
import { useTankopediaTemporary } from '../../../../../../stores/tankopedia';
import { TankSearch } from '../../../components/TankSearch';

export function AntagonistBar() {
  const antagonist = useDuel((state) => state.antagonist!);
  const mode = useTankopediaTemporary((state) => state.mode);
  const [tab, setTab] = useState('search');
  const [antagonistSelectorOpen, setAntagonistSelectorVisible] =
    useState(false);

  if (mode !== 'armor') return null;

  return (
    <Card>
      <Flex align="center" justify="between" gap="2">
        <Flex>
          {antagonist.gun.shells.map((shell, index) => {
            return (
              <ModuleButton
                selected={antagonist.shell.id === shell.id}
                type="shell"
                shell={shell.icon}
                rowChild
                first={index === 0}
                key={shell.id}
                last={index === antagonist.gun.shells.length - 1}
                onClick={() => {
                  mutateDuel((draft) => {
                    draft.antagonist!.shell = shell;
                  });
                }}
              />
            );
          })}
        </Flex>

        <Flex align="center" gap="4">
          <Text>Versus</Text>

          <Dialog.Root
            open={antagonistSelectorOpen}
            onOpenChange={setAntagonistSelectorVisible}
          >
            <Dialog.Trigger>
              <Button variant="ghost">
                <Flex gap="2" align="center">
                  {antagonist.tank.name}
                  <SmallTankIcon id={antagonist.tank.id} size={16} />
                  <CaretRightIcon />
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
                              <Tooltip content={turret.name} key={turret.id}>
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
                                  }}
                                  selected={antagonist.turret.id === turret.id}
                                  tier={turret.tier}
                                  type="module"
                                  module="turret"
                                />
                              </Tooltip>
                            ))}
                          </Flex>
                          <Flex>
                            {antagonist.turret.guns.map((gun, index) => (
                              <Tooltip content={gun.name} key={gun.id}>
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
                                  tier={gun.tier}
                                  type="module"
                                  module="gun"
                                />
                              </Tooltip>
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

        <Button
          variant="ghost"
          onClick={() => {
            mutateDuel((draft) => {
              [draft.protagonist, draft.antagonist] = [
                draft.antagonist,
                draft.protagonist,
              ];
            });
          }}
        >
          <ShuffleIcon /> Swap tanks
        </Button>
      </Flex>
    </Card>
  );
}
