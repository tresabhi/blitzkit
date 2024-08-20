import { Code, Flex, Heading, Text } from '@radix-ui/themes';
import { classIcons } from '../../../../../../components/ClassIcon';
import { asset } from '../../../../../../core/blitzkit/asset';
import { tankIcon } from '../../../../../../core/blitzkit/tankIcon';
import strings from '../../../../../../lang/en-US.json';
import * as App from '../../../../../../stores/app';
import * as Duel from '../../../../../../stores/duel';

export function MetaSection() {
  const developerMode = App.useDeferred(false, (state) => state.developerMode);
  const tank = Duel.use((state) => state.protagonist.tank);
  const ClassIcon = classIcons[tank.class];

  return (
    <Flex justify="center" align="center" py="8" px="4">
      <Flex align="center" justify="center" gap="8" wrap="wrap">
        <img alt="Economics" src={tankIcon(tank.id)} />

        <Flex gap="6" wrap="wrap" align="start" justify="center">
          <Flex direction="column" gap="2">
            <Heading>Overview</Heading>

            <Flex gap="6">
              <Flex direction="column">
                <Text color="gray">Name</Text>
                {tank.nameFull && <Text color="gray">Full-name</Text>}
                <Text color="gray">Nation</Text>
                <Text color="gray">Tier</Text>
                <Text color="gray">Class</Text>
                <Text color="gray">Type</Text>
                {developerMode && (
                  <Text color="gray">
                    <b>DEV:</b> ID
                  </Text>
                )}
              </Flex>

              <Flex direction="column" align="end">
                <Text>{tank.name}</Text>
                {tank.nameFull && <Text>{tank.nameFull}</Text>}
                <Text>
                  <Flex align="center" gap="1">
                    <img
                      style={{ width: '1em', height: '1em' }}
                      alt={tank.nation}
                      src={asset(`flags/circle/${tank.nation}.webp`)}
                    />
                    {
                      strings.common.nations[
                        tank.nation as keyof typeof strings.common.nations
                      ]
                    }
                  </Flex>
                </Text>
                <Text>{tank.tier}</Text>
                <Text>
                  <Flex align="center" gap="1">
                    <ClassIcon width="1em" height="1em" />
                    {strings.common.tank_class_short[tank.class]}
                  </Flex>
                </Text>
                <Text
                  color={
                    tank.treeType === 'collector'
                      ? 'blue'
                      : tank.treeType === 'premium'
                        ? 'amber'
                        : undefined
                  }
                >
                  {strings.common.tree_type[tank.treeType]}
                </Text>
                {developerMode && <Code color="gray">{tank.id}</Code>}
              </Flex>
            </Flex>
          </Flex>

          <Flex direction="column" gap="2">
            <Heading>Economics</Heading>

            <Flex gap="6">
              <Flex direction="column">
                <Text color="gray">
                  {tank.price.type === 'credits' ? 'Purchase' : 'Restoration'}{' '}
                  price
                </Text>
                <Text color="gray">Sale price</Text>
                {tank.xp && <Text color="gray">Research XP</Text>}
              </Flex>

              <Flex direction="column" align="end">
                <Flex align="center" gap="2">
                  <Text>{tank.price.value.toLocaleString()}</Text>
                  <img
                    style={{ width: '1em', height: '1em' }}
                    alt={tank.price.type}
                    src={asset(
                      `icons/currencies/${tank.price.type === 'gold' ? 'gold' : 'silver'}.webp`,
                    )}
                  />
                </Flex>

                <Flex align="center" gap="2">
                  <Text>{(tank.price.value / 2).toLocaleString()}</Text>
                  <img
                    style={{ width: '1em', height: '1em' }}
                    alt={tank.price.type}
                    src={asset(
                      `icons/currencies/${tank.price.type === 'gold' ? 'gold' : 'silver'}.webp`,
                    )}
                  />
                </Flex>

                {tank.xp && (
                  <Flex align="center" gap="2">
                    <Text>{tank.xp.toLocaleString()}</Text>
                    <img
                      style={{ width: '1em', height: '1em' }}
                      alt="xp"
                      src={asset('icons/currencies/xp.webp')}
                    />
                  </Flex>
                )}
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
