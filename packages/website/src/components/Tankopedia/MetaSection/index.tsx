import {
  assertSecret,
  asset,
  TankPriceType,
  TankType,
  TIER_ROMAN_NUMERALS,
} from '@blitzkit/core';
import { ChevronLeftIcon, MixIcon, UpdateIcon } from '@radix-ui/react-icons';
import { Button, Code, Dialog, Flex, Link } from '@radix-ui/themes';
import { useState } from 'react';
import { awaitableModelDefinitions } from '../../../core/awaitables/modelDefinitions';
import { awaitableProvisionDefinitions } from '../../../core/awaitables/provisionDefinitions';
import { tankToDuelMember } from '../../../core/blitzkit/tankToDuelMember';
import { useLocale } from '../../../hooks/useLocale';
import { App } from '../../../stores/app';
import { Duel } from '../../../stores/duel';
import { TankopediaEphemeral } from '../../../stores/tankopediaEphemeral';
import { classIcons } from '../../ClassIcon';
import { LinkI18n } from '../../LinkI18n';
import { ScienceIcon } from '../../ScienceIcon';
import { TankSearch } from '../../TankSearch';
import { Listing } from './components/Listing';

const [provisionDefinitions, modelDefinitions] = await Promise.all([
  awaitableProvisionDefinitions,
  awaitableModelDefinitions,
]);

export function MetaSection() {
  const developerMode = App.useDeferred((state) => state.developerMode, false);
  const protagonist = Duel.use((state) => state.protagonist.tank);
  const antagonist = Duel.use((state) => state.antagonist.tank);
  const ClassIcon = classIcons[protagonist.class];
  const compareTanks =
    protagonist.id === antagonist.id
      ? [protagonist.id]
      : [protagonist.id, antagonist.id];
  const mutateDuel = Duel.useMutation();
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();
  const [showSwapDialog, setShowSwapDialog] = useState(false);
  const { locale, strings, unwrap } = useLocale();

  return (
    <Flex justify="center" align="center">
      <Flex direction="column" align="center" gap="6">
     

        <Flex
          gap={{ initial: '0', sm: '6' }}
          direction={{ initial: 'column', sm: 'row' }}
        >
          <Flex direction="column" width="100%">
            {protagonist.name_full && (
              <Listing label={strings.website.tools.tankopedia.meta.full_name}>
                {unwrap(protagonist.name_full)}
              </Listing>
            )}
            <Listing label={strings.website.tools.tankopedia.meta.nation}>
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
            <Listing label={strings.website.tools.tankopedia.meta.class}>
              <Flex align="center" gap="1">
                <ClassIcon width="1em" height="1em" />
                {strings.common.tank_class_short[protagonist.class]}
              </Flex>
            </Listing>
            <Listing label={strings.website.tools.tankopedia.meta.tier}>
              {TIER_ROMAN_NUMERALS[protagonist.tier]}
            </Listing>
            <Listing
              label={strings.website.tools.tankopedia.meta.type}
              color={
                protagonist.type === TankType.COLLECTOR
                  ? 'blue'
                  : protagonist.type === TankType.PREMIUM
                    ? 'amber'
                    : undefined
              }
            >
              {strings.common.tree_type[protagonist.type]}
            </Listing>
          </Flex>

          <Flex direction="column" width="100%">
            {developerMode && (
              <Listing label={strings.website.tools.tankopedia.meta.dev_id}>
                <Code>{protagonist.id}</Code>
              </Listing>
            )}
            {protagonist.type === TankType.PREMIUM && (
              <Listing label={strings.website.tools.tankopedia.meta.purchase}>
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
              label={
                protagonist.type === TankType.RESEARCHABLE
                  ? strings.website.tools.tankopedia.meta.purchase
                  : strings.website.tools.tankopedia.meta.restoration
              }
            >
              <Flex align="center" gap="1">
                {protagonist.price.value.toLocaleString(locale)}
                <img
                  style={{ width: '1em', height: '1em' }}
                  alt={TankPriceType[protagonist.price.type]}
                  src={asset(
                    `icons/currencies/${
                      protagonist.price.type === TankPriceType.GOLD
                        ? 'gold'
                        : 'silver'
                    }.webp`,
                  )}
                />
              </Flex>
            </Listing>
            <Listing label={strings.website.tools.tankopedia.meta.sale}>
              <Flex align="center" gap="1">
                {(protagonist.price.value / 2).toLocaleString(locale)}
                <img
                  style={{ width: '1em', height: '1em' }}
                  alt={TankPriceType[protagonist.price.type]}
                  src={asset(
                    `icons/currencies/${
                      protagonist.price.type === TankPriceType.GOLD
                        ? 'gold'
                        : 'silver'
                    }.webp`,
                  )}
                />
              </Flex>
            </Listing>
            {protagonist.research_cost && (
              <Listing label={strings.website.tools.tankopedia.meta.research}>
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
            )}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
