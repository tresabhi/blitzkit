import { Nation, TankType } from '@protos/blitz_static_tank_component';
import { Box, Code, Flex } from '@radix-ui/themes';
import { asset, TIER_ROMAN_NUMERALS } from 'packages/core/src';
import { Var } from '../../core/radix/var';
import { useLocale } from '../../hooks/useLocale';
import { App } from '../../stores/app';
import { TankopediaEphemeral_ue } from '../../stores/tankopediaEphemeral_ue';
import { classIcons_ue } from '../ClassIcon';
import { Listing } from '../Tankopedia/MetaSection/components/Listing';

const NATIONAL_BANNER_POSITION_OVERRIDES: Record<string, string> = {
  germany: '50% 35%',
  france: '50% 35%',
  other: '50% 35%',
};

export function MetaSection() {
  const developerMode = App.useDeferred((state) => state.developerMode, false);
  const tank = TankopediaEphemeral_ue.use((state) => state.tank);
  const ClassIcon = classIcons_ue[tank.tank_class];
  const { locale, strings } = useLocale();

  return (
    <Flex justify="center" mt="-9">
      <Box
        style={{
          background: `url(/assets/images/national-wallpapers/${tank.nation}.jpg)`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition:
            NATIONAL_BANNER_POSITION_OVERRIDES[tank.nation] ?? 'center',
        }}
        flexGrow="1"
        maxWidth="120rem"
      >
        <Box
          style={{
            background: `url(${asset(`flags/scratched/${tank.nation}.webp`)})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'min(53rem, 80vw)',
            backgroundPosition: '-8rem 50%',
          }}
        >
          <Flex
            justify="center"
            align="center"
            py="6rem"
            style={{
              background: `linear-gradient(${Var('black-a8')}, ${Var('black-a8')}, ${Var('gray-1')})`,
            }}
          >
            <Flex direction="column" align="center" gap="6">
              <Flex
                gap={{ initial: '2', sm: '8' }}
                direction={{ initial: 'column', sm: 'row' }}
              >
                <Flex direction="column" width="100%" gap="2">
                  <Listing label={strings.website.tools.tankopedia.meta.nation}>
                    <Flex align="center" gap="1">
                      <img
                        style={{ width: '1em', height: '1em' }}
                        alt={Nation[tank.nation]}
                        src={asset(`flags/circle/${tank.nation}.webp`)}
                      />
                      {strings.common.nations[tank.nation]}
                    </Flex>
                  </Listing>
                  <Listing label={strings.website.tools.tankopedia.meta.class}>
                    <Flex align="center" gap="1">
                      <ClassIcon width="1em" height="1em" />
                      {strings.common.tank_class[tank.tank_class]}
                    </Flex>
                  </Listing>
                  <Listing label={strings.website.tools.tankopedia.meta.tier}>
                    {TIER_ROMAN_NUMERALS[tank.tier]}
                  </Listing>
                  <Listing
                    label={strings.website.tools.tankopedia.meta.type}
                    color={
                      tank.tank_type === TankType.TANK_TYPE_COLLECTIBLE
                        ? 'blue'
                        : tank.tank_type === TankType.TANK_TYPE_PREMIUM
                          ? 'amber'
                          : undefined
                    }
                  >
                    {strings.common.tree_type[tank.tank_type]}
                  </Listing>
                </Flex>

                <Flex direction="column" width="100%" gap="2">
                  {developerMode && (
                    <Listing
                      label={strings.website.tools.tankopedia.meta.dev_id}
                    >
                      <Code>TANK_ID</Code>
                    </Listing>
                  )}
                  {tank.tank_type === TankType.TANK_TYPE_PREMIUM && (
                    <Listing
                      label={strings.website.tools.tankopedia.meta.purchase}
                    >
                      <Flex align="center" gap="1">
                        {(9999999999).toLocaleString(locale)}
                        <img
                          style={{ width: '1em', height: '1em' }}
                          alt="gold"
                          src={asset('icons/currencies/gold.webp')}
                        />
                      </Flex>
                    </Listing>
                  )}
                  <Listing
                    label={
                      tank.tank_type === TankType.TANK_TYPE_COMMON
                        ? strings.website.tools.tankopedia.meta.purchase
                        : strings.website.tools.tankopedia.meta.restoration
                    }
                  >
                    <Flex align="center" gap="1">
                      {(999999999).toLocaleString(locale)}
                      <img
                        style={{ width: '1em', height: '1em' }}
                        alt="TODO: REPLACE WITH CURRENCY NAME"
                        // src={asset(
                        //   `icons/currencies/${
                        //     protagonist.price.type === TankPriceType.GOLD
                        //       ? 'gold'
                        //       : 'silver'
                        //   }.webp`,
                        // )}
                      />
                    </Flex>
                  </Listing>
                  <Listing label={strings.website.tools.tankopedia.meta.sale}>
                    <Flex align="center" gap="1">
                      {(999999999).toLocaleString(locale)}
                      <img
                        style={{ width: '1em', height: '1em' }}
                        alt="TODO: REPLACE WITH CURRENCY NAME"
                        // src={asset(
                        //   `icons/currencies/${
                        //     protagonist.price.type === TankPriceType.GOLD
                        //       ? 'gold'
                        //       : 'silver'
                        //   }.webp`,
                        // )}
                      />
                    </Flex>
                  </Listing>
                  {/* TODO: ADD RESEARCH COST */}
                  {/* {protagonist.research_cost && (
                    <Listing
                      label={strings.website.tools.tankopedia.meta.research}
                    >
                      <Flex align="center" gap="1">
                        {(
                          protagonist.research_cost.research_cost_type!
                            .value as number
                        ).toLocaleString(locale)}
                        <img
                          style={{ width: '1em', height: '1em' }}
                          alt="xp"
                          src={asset('icons/currencies/xp.webp')}
                        />
                      </Flex>
                    </Listing>
                  )} */}
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
}
