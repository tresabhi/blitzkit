import { Code, Flex, Heading } from '@radix-ui/themes';
import { classIcons } from '../../../../../../../components/ClassIcon';
import { asset } from '../../../../../../../core/blitzkit/asset';
import { tankIcon } from '../../../../../../../core/blitzkit/tankIcon';
import strings from '../../../../../../../lang/en-US.json';
import * as App from '../../../../../../../stores/app';
import * as Duel from '../../../../../../../stores/duel';
import { Listing } from './components/Listing';

export function MetaSection() {
  const developerMode = App.useDeferred(false, (state) => state.developerMode);
  const tank = Duel.use((state) => state.protagonist.tank);
  const ClassIcon = classIcons[tank.class];

  return (
    <Flex justify="center" align="center" py="8" px="4">
      <Flex
        align="center"
        justify="center"
        gap="8"
        direction={{ initial: 'column', sm: 'row' }}
      >
        <img alt="Economics" src={tankIcon(tank.id)} />

        <Flex
          gap="6"
          justify="center"
          direction={{ initial: 'column', sm: 'row' }}
        >
          <Flex direction="column" minWidth="15rem">
            <Heading mb="2" align={{ initial: 'center', sm: 'left' }}>
              Overview
            </Heading>

            <Listing label="Name">{tank.name}</Listing>
            {tank.nameFull && (
              <Listing label="Full-name">{tank.nameFull}</Listing>
            )}
            <Listing label="Nation">
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
            </Listing>
            <Listing label="Tier">{tank.tier}</Listing>
            <Listing label="Class">
              <Flex align="center" gap="1">
                <ClassIcon width="1em" height="1em" />
                {strings.common.tank_class_short[tank.class]}
              </Flex>
            </Listing>
            <Listing
              label="Type"
              color={
                tank.treeType === 'collector'
                  ? 'blue'
                  : tank.treeType === 'premium'
                    ? 'amber'
                    : undefined
              }
            >
              {strings.common.tree_type[tank.treeType]}
            </Listing>
            {developerMode && (
              <Listing label="DEV: ID">
                <Code>{tank.id}</Code>
              </Listing>
            )}
          </Flex>

          <Flex direction="column" minWidth="12rem">
            <Heading mb="2" align={{ initial: 'center', sm: 'left' }}>
              Economics
            </Heading>

            <Listing
              label={`${tank.price.type === 'credits' ? 'Purchase' : 'Restoration'} price`}
            >
              <Flex align="center" gap="1">
                {tank.price.value.toLocaleString()}
                <img
                  style={{ width: '1em', height: '1em' }}
                  alt={tank.price.type}
                  src={asset(
                    `icons/currencies/${tank.price.type === 'gold' ? 'gold' : 'silver'}.webp`,
                  )}
                />
              </Flex>
            </Listing>
            <Listing label="Sale price">
              <Flex align="center" gap="1">
                {(tank.price.value / 2).toLocaleString()}
                <img
                  style={{ width: '1em', height: '1em' }}
                  alt={tank.price.type}
                  src={asset(
                    `icons/currencies/${tank.price.type === 'gold' ? 'gold' : 'silver'}.webp`,
                  )}
                />
              </Flex>
            </Listing>
            {tank.xp && (
              <Listing label="Research XP">
                <Flex align="center" gap="1">
                  {tank.xp.toLocaleString()}
                  <img
                    style={{ width: '1em', height: '1em' }}
                    alt="xp"
                    src={asset('icons/currencies/xp.webp')}
                  />
                </Flex>
              </Listing>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
