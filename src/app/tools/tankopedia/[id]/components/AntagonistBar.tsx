import {
  CaretRightIcon,
  Cross1Icon,
  MagnifyingGlassIcon,
  ShuffleIcon,
} from '@radix-ui/react-icons';
import {
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  Tabs,
  Text,
  TextField,
  Tooltip,
} from '@radix-ui/themes';
import { go } from 'fuzzysort';
import { debounce } from 'lodash';
import { use, useRef, useState } from 'react';
import { ModuleButton } from '../../../../../components/ModuleButton';
import { SmallTankIcon } from '../../../../../components/SmallTankIcon';
import {
  SHELL_NAMES,
  tankDefinitions,
  tankNamesDiacritics,
} from '../../../../../core/blitzkrieg/tankDefinitions';
import mutateTankopedia, {
  useTankopedia,
} from '../../../../../stores/tankopedia';

export function AntagonistBar() {
  const awaitedTankDefinitions = use(tankDefinitions);
  const mode = useTankopedia((state) => state.mode);
  const awaitedTankNamesDiacritics = use(tankNamesDiacritics);
  const [tab, setTab] = useState('search');
  const searchInput = useRef<HTMLInputElement>(null);
  const antagonist = useTankopedia((state) => {
    if (!state.areTanksAssigned) return;
    return state.antagonist;
  });
  const [searchResults, setSearchResults] = useState<number[]>([]);

  if (!antagonist || mode !== 'armor') return null;

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
                  mutateTankopedia((draft) => {
                    if (!draft.areTanksAssigned) return;
                    draft.antagonist.shell = shell;
                  });
                }}
              />
            );
          })}
        </Flex>

        <Flex align="center" gap="4">
          <Text>Versus</Text>

          <Dialog.Root>
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
                      <TextField.Root>
                        <TextField.Slot>
                          <MagnifyingGlassIcon />
                        </TextField.Slot>
                        <TextField.Input
                          ref={searchInput}
                          placeholder="Search tank..."
                          onChange={debounce(() => {
                            setSearchResults(
                              go(
                                searchInput.current!.value,
                                awaitedTankNamesDiacritics,
                                { key: 'combined', limit: 8 },
                              ).map((item) => item.obj.id),
                            );
                          }, 500)}
                        />
                      </TextField.Root>

                      <Flex direction="column" gap="2">
                        {(searchResults.length > 0 ||
                          searchInput.current?.value) && (
                          <Flex direction="column" gap="2">
                            {searchResults
                              .map((id) => awaitedTankDefinitions[id])
                              .map((tank) => (
                                <Button
                                  color={
                                    tank.tree_type === 'researchable'
                                      ? 'gray'
                                      : tank.tree_type === 'premium'
                                        ? 'amber'
                                        : 'blue'
                                  }
                                  key={tank.id}
                                  variant="ghost"
                                  onClick={() => {
                                    mutateTankopedia((draft) => {
                                      if (!draft.areTanksAssigned) return;

                                      draft.antagonist.tank = tank;
                                      draft.antagonist.turret =
                                        tank.turrets.at(-1)!;
                                      draft.antagonist.gun =
                                        draft.antagonist.turret.guns.at(-1)!;
                                      draft.antagonist.shell =
                                        draft.antagonist.gun.shells[0];
                                    });
                                    setSearchResults([]);
                                    searchInput.current!.value = '';
                                    setTab('configure');
                                  }}
                                >
                                  {tank.name}
                                </Button>
                              ))}

                            {searchResults.length === 0 &&
                              (searchInput.current
                                ? searchInput.current.value.length > 0
                                : false) && (
                                <Button disabled variant="ghost">
                                  No search results
                                </Button>
                              )}
                          </Flex>
                        )}
                      </Flex>
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
                                    mutateTankopedia((draft) => {
                                      if (!draft.areTanksAssigned) return;

                                      draft.antagonist.turret = turret;
                                      draft.antagonist.gun =
                                        turret.guns.at(-1)!;
                                      draft.antagonist.shell =
                                        draft.antagonist.gun.shells[0];
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
                                    mutateTankopedia((draft) => {
                                      if (!draft.areTanksAssigned) return;
                                      draft.antagonist.gun = gun;
                                      draft.antagonist.shell = gun.shells[0];
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
                                <b>{shell.damage.armor} HP</b>
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
            mutateTankopedia((draft) => {
              if (!draft.areTanksAssigned) return;

              [draft.antagonist, draft.protagonist] = [
                draft.protagonist,
                draft.antagonist,
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
