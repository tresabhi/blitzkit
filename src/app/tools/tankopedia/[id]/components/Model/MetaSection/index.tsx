import { ChevronLeftIcon, MixIcon } from '@radix-ui/react-icons';
import { Button, Code, Flex } from '@radix-ui/themes';
import { classIcons } from '../../../../../../../components/ClassIcon';
import { Link } from '../../../../../../../components/Link';
import { asset } from '../../../../../../../core/blitzkit/asset';
import strings from '../../../../../../../lang/en-US.json';
import * as App from '../../../../../../../stores/app';
import * as Duel from '../../../../../../../stores/duel';
import { Listing } from './components/Listing';
import { Votes } from './components/Votes';

export function MetaSection() {
  const developerMode = App.useDeferred(false, (state) => state.developerMode);
  const protagonist = Duel.use((state) => state.protagonist.tank);
  const ClassIcon = classIcons[protagonist.class];
  const antagonist = Duel.use((state) => state.antagonist.tank);
  const compareTanks =
    protagonist.id === antagonist.id
      ? [protagonist.id]
      : [protagonist.id, antagonist.id];

  return (
    <Flex justify="center" align="center">
      <Flex direction="column" align="center" gap="6">
        <Flex gap="2">
          <Link href="/tools/tankopedia">
            <Button variant="outline">
              <ChevronLeftIcon />
              Back
            </Button>
          </Link>

          <Link href={`/tools/compare?tanks=${compareTanks.join('%2C')}`}>
            <Button>
              <MixIcon />
              Compare
            </Button>
          </Link>
        </Flex>

        <Flex
          gap={{ initial: '0', sm: '6' }}
          direction={{ initial: 'column', sm: 'row' }}
        >
          <Flex direction="column" width="100%">
            {protagonist.nameFull && (
              <Listing label="Full-name">{protagonist.nameFull}</Listing>
            )}
            <Listing label="Nation">
              <Flex align="center" gap="1">
                <img
                  style={{ width: '1em', height: '1em' }}
                  alt={protagonist.nation}
                  src={asset(`flags/circle/${protagonist.nation}.webp`)}
                />
                {
                  strings.common.nations[
                    protagonist.nation as keyof typeof strings.common.nations
                  ]
                }
              </Flex>
            </Listing>
            <Listing label="Class">
              <Flex align="center" gap="1">
                <ClassIcon width="1em" height="1em" />
                {strings.common.tank_class_short[protagonist.class]}
              </Flex>
            </Listing>
            <Listing label="Tier">{protagonist.tier}</Listing>
            <Listing
              label="Type"
              color={
                protagonist.treeType === 'collector'
                  ? 'blue'
                  : protagonist.treeType === 'premium'
                    ? 'amber'
                    : undefined
              }
            >
              {strings.common.tree_type[protagonist.treeType]}
            </Listing>
          </Flex>

          <Flex direction="column" width="100%">
            {developerMode && (
              <Listing label="DEV: ID">
                <Code>{protagonist.id}</Code>
              </Listing>
            )}
            {protagonist.treeType === 'premium' && (
              <Listing label="Purchase price">
                <Flex align="center" gap="1">
                  {protagonist.price.value / 400}
                  <img
                    style={{ width: '1em', height: '1em' }}
                    alt="gold"
                    src={asset('icons/currencies/gold.webp')}
                  />
                </Flex>
              </Listing>
            )}
            <Listing
              label={`${protagonist.treeType === 'researchable' ? 'Purchase' : 'Restoration'} price`}
            >
              <Flex align="center" gap="1">
                {protagonist.price.value.toLocaleString()}
                <img
                  style={{ width: '1em', height: '1em' }}
                  alt={protagonist.price.type}
                  src={asset(
                    `icons/currencies/${protagonist.price.type === 'gold' ? 'gold' : 'silver'}.webp`,
                  )}
                />
              </Flex>
            </Listing>
            <Listing label="Sale price">
              <Flex align="center" gap="1">
                {(protagonist.price.value / 2).toLocaleString()}
                <img
                  style={{ width: '1em', height: '1em' }}
                  alt={protagonist.price.type}
                  src={asset(
                    `icons/currencies/${protagonist.price.type === 'gold' ? 'gold' : 'silver'}.webp`,
                  )}
                />
              </Flex>
            </Listing>
            {protagonist.xp && (
              <Listing label="Research XP">
                <Flex align="center" gap="1">
                  {protagonist.xp.toLocaleString()}
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

        <Votes />
      </Flex>
    </Flex>
  );
}
