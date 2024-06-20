import { Flex, Grid, Heading, Link, Separator, Text } from '@radix-ui/themes';
import { range } from 'lodash';
import { memo, use } from 'react';
import { classIcons } from '../../../../components/ClassIcon';
import { TANK_CLASSES } from '../../../../components/Tanks/components/Item/constants';
import { asset } from '../../../../core/blitzkit/asset';
import { gameDefinitions } from '../../../../core/blitzkit/gameDefinitions';
import {
  Tier,
  tanksDefinitionsArray,
} from '../../../../core/blitzkit/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../../../../core/blitzkit/tankDefinitions/constants';
import { tankIcon } from '../../../../core/blitzkit/tankIcon';
import { TankopediaSearchPageFilters } from '../page';
import { treeTypeOrder } from './TankSearch/constants';

interface ResultsProps {
  filters: TankopediaSearchPageFilters;
}

export const Results = memo<ResultsProps>(({ filters }) => {
  const awaitedTanksDefinitionsArray = use(tanksDefinitionsArray);
  const tanksFiltered = awaitedTanksDefinitionsArray.filter((tank) => {
    return (
      (filters.tier === undefined || filters.tier === tank.tier) &&
      (filters.nation === undefined || filters.nation === tank.nation) &&
      (filters.class === undefined || filters.class === tank.class) &&
      (filters.type === undefined || filters.type === tank.treeType) &&
      (filters.testing === 'include' ||
        (filters.testing === 'only' && tank.testing) ||
        (filters.testing === 'exclude' && !tank.testing))
    );
  });
  const awaitedGameDefinitions = use(gameDefinitions);

  return (
    <Flex direction="column" gap="8" flexGrow="1">
      {range(10, 0).map((tierUntyped) => {
        const tier = tierUntyped as Tier;
        const tierTanks = tanksFiltered
          .filter((tank) => tank.tier === tier)
          .sort(
            (a, b) =>
              treeTypeOrder.indexOf(a.treeType) -
              treeTypeOrder.indexOf(b.treeType),
          )
          .sort(
            (a, b) =>
              TANK_CLASSES.indexOf(a.class) - TANK_CLASSES.indexOf(b.class),
          )
          .sort(
            (a, b) =>
              awaitedGameDefinitions.nations.indexOf(a.nation) -
              awaitedGameDefinitions.nations.indexOf(b.nation),
          );

        if (tierTanks.length === 0) return null;

        return (
          <Flex key={tier} direction="column" gap="4">
            <Flex align="center" mb="4" gap="4">
              <Heading weight="regular">
                Tier {TIER_ROMAN_NUMERALS[tier]}
              </Heading>
              <Separator style={{ flex: 1 }} />
            </Flex>

            <Grid
              flexGrow="1"
              columns="repeat(auto-fill, minmax(100px, 1fr))"
              gap="2"
              gapY="6"
            >
              {tierTanks.map((tank) => {
                const Icon = classIcons[tank.class];

                return (
                  <Link
                    key={tank.id}
                    size="1"
                    color={
                      tank.treeType === 'collector'
                        ? 'blue'
                        : tank.treeType === 'premium'
                          ? 'amber'
                          : 'gray'
                    }
                    highContrast={tank.treeType === 'researchable'}
                    underline="hover"
                    href={`/tools/tankopedia/${tank.id}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      background: `url(${asset(`flags/scratched/${tank.nation}.webp`)})`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'top left',
                    }}
                  >
                    <img
                      alt={tank.name}
                      src={tankIcon(tank.id)}
                      height={64}
                      style={{
                        width: '100%',
                        objectPosition: 'center right',
                        objectFit: 'contain',
                      }}
                    />

                    <Flex
                      justify="center"
                      gap="1"
                      align="center"
                      overflow="hidden"
                      width="100%"
                      maxWidth="100%"
                    >
                      <Icon
                        style={{
                          width: '1em',
                          height: '1em',
                          minWidth: '1em',
                          minHeight: '1em',
                        }}
                      />
                      <Text
                        align="center"
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {tank.name}
                      </Text>
                    </Flex>
                  </Link>
                );
              })}
            </Grid>
          </Flex>
        );
      })}
    </Flex>
  );
});
