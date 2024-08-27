import { Code, Flex } from '@radix-ui/themes';
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
    <Flex
      justify="center"
      align="center"
      gap="6"
      direction={{ initial: 'column', sm: 'row' }}
    >
      <img
        alt={tank.name}
        src={tankIcon(tank.id)}
        style={{
          objectFit: 'contain',
          height: '8rem',
          width: '8rem',
        }}
      />

      <Flex
        wrap={{ initial: 'nowrap', sm: 'wrap' }}
        direction={{ initial: 'column', sm: 'row' }}
        align={{ initial: 'center', sm: 'start' }}
        gapX="6"
        width="100%"
        maxWidth="calc(2 * 15rem + var(--space-6))"
      >
        {tank.nameFull && <Listing label="Full-name">{tank.nameFull}</Listing>}
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
        {tank.treeType === 'premium' && (
          <Listing label="Purchase price">
            <Flex align="center" gap="1">
              {tank.price.value / 400}
              <img
                style={{ width: '1em', height: '1em' }}
                alt="gold"
                src={asset('icons/currencies/gold.webp')}
              />
            </Flex>
          </Listing>
        )}
        <Listing
          label={`${tank.treeType === 'researchable' ? 'Purchase' : 'Restoration'} price`}
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
  );
}
