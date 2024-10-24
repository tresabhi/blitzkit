import {
  assertSecret,
  asset,
  fetchModelDefinitions,
  fetchProvisionDefinitions,
  TankPriceType,
  TankType,
  TIER_ROMAN_NUMERALS,
} from '@blitzkit/core';
import strings from '@blitzkit/core/lang/en-US.json';
import { ChevronLeftIcon, MixIcon, UpdateIcon } from '@radix-ui/react-icons';
import { Button, Code, Dialog, Flex, Link } from '@radix-ui/themes';
import { useState } from 'react';
import { tankToDuelMember } from '../../../core/blitzkit/tankToDuelMember';
import { App } from '../../../stores/app';
import { Duel } from '../../../stores/duel';
import { TankopediaEphemeral } from '../../../stores/tankopediaEphemeral';
import { classIcons } from '../../ClassIcon';
import { ScienceIcon } from '../../ScienceIcon';
import { TankSearch } from '../../TankSearch';
import { Listing } from './components/Listing';

const provisionDefinitions = await fetchProvisionDefinitions();
const modelDefinitions = await fetchModelDefinitions();

export function MetaSection() {
  const developerMode = App.useDeferred((state) => state.developerMode, false);
  const protagonist = Duel.use((state) => state.protagonist.tank);
  const ClassIcon = classIcons[protagonist.class];
  const antagonist = Duel.use((state) => state.antagonist.tank);
  const compareTanks =
    protagonist.id === antagonist.id
      ? [protagonist.id]
      : [protagonist.id, antagonist.id];
  const mutateDuel = Duel.useMutation();
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();
  const [showSwapDialog, setShowSwapDialog] = useState(false);

  return (
    <Flex justify="center" align="center">
      <Flex direction="column" align="center" gap="6">
        <Flex gap="2" wrap="wrap" justify="center" align="center">
          <Link href="/tools/tankopedia">
            <Button variant="outline">
              <ChevronLeftIcon />
              Back
            </Button>
          </Link>

          <Link href={`/tools/compare?tanks=${compareTanks.join('%2C')}`}>
            <Button variant="outline">
              <MixIcon />
              Compare
            </Button>
          </Link>

          {assertSecret(import.meta.env.PUBLIC_PROMOTE_OPENTEST) === 'true' && (
            <Link
              href={`https://opentest.blitzkit.app/tools/tankopedia/${protagonist.id}`}
            >
              <Button variant="outline" color="green">
                <ScienceIcon height="1.25em" width="1.25em" />
                OpenTest
              </Button>
            </Link>
          )}

          <Dialog.Root open={showSwapDialog} onOpenChange={setShowSwapDialog}>
            <Dialog.Trigger>
              <Button>
                <UpdateIcon />
                Swap
              </Button>
            </Dialog.Trigger>

            <Dialog.Content>
              <Dialog.Title>Swap tanks</Dialog.Title>

              <TankSearch
                compact
                onSelect={(tank) => {
                  setShowSwapDialog(false);
                  mutateTankopediaEphemeral((draft) => {
                    draft.model = modelDefinitions.models[tank.id];
                  });
                  mutateDuel((draft) => {
                    draft.protagonist = tankToDuelMember(
                      tank,
                      provisionDefinitions,
                    );
                  });

                  window.history.replaceState(
                    null,
                    '',
                    `/tools/tankopedia/${tank.id}`,
                  );
                }}
              />
            </Dialog.Content>
          </Dialog.Root>
        </Flex>

        <Flex
          gap={{ initial: '0', sm: '6' }}
          direction={{ initial: 'column', sm: 'row' }}
        >
          <Flex direction="column" width="100%">
            {protagonist.name_full && (
              <Listing label="Full-name">{protagonist.name_full}</Listing>
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
            <Listing label="Tier">
              {TIER_ROMAN_NUMERALS[protagonist.tier]}
            </Listing>
            <Listing
              label="Type"
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
              <Listing label="DEV: ID">
                <Code>{protagonist.id}</Code>
              </Listing>
            )}
            {protagonist.type === TankType.PREMIUM && (
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
              label={`${
                protagonist.type === TankType.RESEARCHABLE
                  ? 'Purchase'
                  : 'Restoration'
              } price`}
            >
              <Flex align="center" gap="1">
                {protagonist.price.value.toLocaleString()}
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
            <Listing label="Sale price">
              <Flex align="center" gap="1">
                {(protagonist.price.value / 2).toLocaleString()}
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
              <Listing label="Research XP">
                <Flex align="center" gap="1">
                  {(
                    protagonist.research_cost.research_cost_type!
                      .value as number
                  ).toLocaleString()}
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

        {/* <Votes /> */}
      </Flex>
    </Flex>
  );
}
