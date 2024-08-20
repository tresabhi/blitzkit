import { CheckIcon, Cross1Icon } from '@radix-ui/react-icons';
import { Code, Flex, Heading, Text } from '@radix-ui/themes';
import { classIcons } from '../../../../../../components/ClassIcon';
import { asset } from '../../../../../../core/blitzkit/asset';
import { tankIcon } from '../../../../../../core/blitzkit/tankIcon';
import strings from '../../../../../../lang/en-US.json';
import * as App from '../../../../../../stores/app';
import * as Duel from '../../../../../../stores/duel';

export function MetaSection() {
  const developerMode = App.use((state) => state.developerMode);
  const tank = Duel.use((state) => state.protagonist.tank);
  const rawPrice =
    typeof tank.price === 'number' ? tank.price : tank.price.value;
  const priceType =
    typeof tank.price === 'number' ? 'credits' : tank.price.type;
  const salePrice = 0.5 * rawPrice;
  const purchasePrice = rawPrice;
  let worthSelling: boolean;
  const ClassIcon = classIcons[tank.class];

  if (priceType === 'gold') {
    worthSelling = tank.tier <= 6 || purchasePrice - salePrice <= 500;
  } else {
    worthSelling = tank.tier <= 7;
  }

  return (
    <Flex justify="center" py="8" px="4">
      <Flex align="center" gap="8">
        <img alt="Economics" src={tankIcon(tank.id)} />

        <Flex gap="6" wrap="wrap">
          <Flex direction="column" gap="2">
            <Heading>Overview</Heading>

            <Flex gap="6">
              <Flex direction="column">
                <Text color="gray">Name</Text>
                {tank.nameFull && <Text color="gray">Full-name</Text>}
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
                  {priceType === 'credits' ? 'Purchase' : 'Restoration'} price
                </Text>
                {tank.xp && <Text color="gray">Research XP</Text>}
                <Text color="gray">Sale price</Text>
                <Text color="gray">Worth selling</Text>
              </Flex>

              <Flex direction="column" align="end">
                <Flex align="center" gap="2">
                  <Text>{purchasePrice.toLocaleString()}</Text>
                  <img
                    style={{ width: '1em', height: '1em' }}
                    alt={priceType}
                    src={asset(
                      `icons/currencies/${priceType === 'gold' ? 'gold' : 'silver'}.webp`,
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

                <Flex align="center" gap="2">
                  <Text>{salePrice.toLocaleString()}</Text>
                  <img
                    style={{ width: '1em', height: '1em' }}
                    alt={priceType}
                    src={asset(
                      `icons/currencies/${priceType === 'gold' ? 'gold' : 'silver'}.webp`,
                    )}
                  />
                </Flex>

                <Text color={worthSelling ? 'green' : 'red'}>
                  <Flex align="center" gap="1">
                    {worthSelling ? 'Yes' : 'No'}
                    {worthSelling && <CheckIcon />}
                    {!worthSelling && <Cross1Icon />}
                  </Flex>
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
