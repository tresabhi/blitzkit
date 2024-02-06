'use client';

import { CaretDownIcon } from '@radix-ui/react-icons';
import { Button, DropdownMenu, Flex } from '@radix-ui/themes';
import { use } from 'react';
import { Flag } from '../../../../../../../components/Flag';
import {
  TANK_TYPES,
  TREE_TYPES,
  TREE_TYPE_ICONS,
  TREE_TYPE_IMAGES,
} from '../../../../../../../components/Tanks';
import {
  NATIONS,
  TIERS,
  TIER_ROMAN_NUMERALS,
} from '../../../../../../../core/blitzkrieg/tankDefinitions';
import mutateTankopediaPersistent, {
  TankopediaTestTankDisplay,
  useTankopediaPersistent,
} from '../../../../../../../stores/tankopedia';
import * as styles from './index.css';

export function Options() {
  const nations = use(NATIONS);
  const filters = useTankopediaPersistent((state) => state.filters);

  return (
    <Flex gap="2" wrap="wrap" justify="center">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button variant="soft" color="gray">
            Test tanks
            <CaretDownIcon />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.RadioGroup
            value={filters.test}
            onValueChange={(value) =>
              mutateTankopediaPersistent((draft) => {
                draft.filters.test = value as TankopediaTestTankDisplay;
              })
            }
          >
            <DropdownMenu.RadioItem value="include">
              Include
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="exclude">
              Exclude
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="only">Only</DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <Flex>
        {TREE_TYPES.map((type, index) => (
          <Button
            key={type}
            color={filters.treeTypes.includes(type) ? undefined : 'gray'}
            variant={filters.treeTypes.includes(type) ? 'surface' : 'soft'}
            style={{
              flex: 1,
              margin: -0.5,
              borderTopLeftRadius: index === 0 ? undefined : 0,
              borderBottomLeftRadius: index === 0 ? undefined : 0,
              borderTopRightRadius:
                index === TREE_TYPES.length - 1 ? undefined : 0,
              borderBottomRightRadius:
                index === TREE_TYPES.length - 1 ? undefined : 0,
            }}
            onClick={() =>
              mutateTankopediaPersistent((draft) => {
                if (draft.filters.treeTypes.includes(type)) {
                  draft.filters.treeTypes = draft.filters.treeTypes.filter(
                    (preexistingType) => preexistingType !== type,
                  );
                } else {
                  draft.filters.treeTypes.push(type);
                }
              })
            }
          >
            <img
              src={TREE_TYPE_IMAGES[type]}
              style={{ width: '1em', height: '1em' }}
            />
          </Button>
        ))}
      </Flex>
      <Flex>
        {[...TANK_TYPES].map((type, index) => (
          <Button
            key={type}
            color={filters.types.includes(type) ? undefined : 'gray'}
            variant={filters.types.includes(type) ? 'surface' : 'soft'}
            style={{
              flex: 1,
              margin: -0.5,
              borderTopLeftRadius: index === 0 ? undefined : 0,
              borderBottomLeftRadius: index === 0 ? undefined : 0,
              borderTopRightRadius:
                index === TANK_TYPES.length - 1 ? undefined : 0,
              borderBottomRightRadius:
                index === TANK_TYPES.length - 1 ? undefined : 0,
            }}
            onClick={() =>
              mutateTankopediaPersistent((draft) => {
                if (draft.filters.types.includes(type)) {
                  draft.filters.types = draft.filters.types.filter(
                    (preexistingType) => preexistingType !== type,
                  );
                } else {
                  draft.filters.types.push(type);
                }
              })
            }
          >
            <img
              src={TREE_TYPE_ICONS.researchable[type]}
              style={{ width: '1em', height: '1em' }}
            />
          </Button>
        ))}
      </Flex>
      <Flex
        direction="column"
        className={styles.splitFilters}
        style={{ width: '100%' }}
      >
        <Flex>
          {[...TIERS].slice(0, 5).map((tier, index) => (
            <Button
              key={tier}
              color={filters.tiers.includes(tier) ? undefined : 'gray'}
              variant={filters.tiers.includes(tier) ? 'surface' : 'soft'}
              style={{
                flex: 1,
                margin: -0.5,
                borderTopLeftRadius: index === 0 ? 16 : 0,
                borderBottomLeftRadius: 0,
                borderTopRightRadius:
                  index === TIERS.length - Math.round(TIERS.length / 2) - 1
                    ? 16
                    : 0,
                borderBottomRightRadius: 0,
              }}
              onClick={() =>
                mutateTankopediaPersistent((draft) => {
                  if (draft.filters.tiers.includes(tier)) {
                    draft.filters.tiers = draft.filters.tiers.filter(
                      (preexistingTier) => preexistingTier !== tier,
                    );
                  } else {
                    draft.filters.tiers.push(tier);
                  }
                })
              }
            >
              {TIER_ROMAN_NUMERALS[tier]}
            </Button>
          ))}
        </Flex>
        <Flex>
          {[...TIERS].slice(5).map((tier, index) => (
            <Button
              key={tier}
              color={filters.tiers.includes(tier) ? undefined : 'gray'}
              variant={filters.tiers.includes(tier) ? 'surface' : 'soft'}
              style={{
                flex: 1,
                margin: -0.5,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: index === 0 ? 16 : 0,
                borderTopRightRadius: 0,
                borderBottomRightRadius:
                  index === TIERS.length - Math.round(TIERS.length / 2) - 1
                    ? 16
                    : 0,
              }}
              onClick={() =>
                mutateTankopediaPersistent((draft) => {
                  if (draft.filters.tiers.includes(tier)) {
                    draft.filters.tiers = draft.filters.tiers.filter(
                      (preexistingTier) => preexistingTier !== tier,
                    );
                  } else {
                    draft.filters.tiers.push(tier);
                  }
                })
              }
            >
              {TIER_ROMAN_NUMERALS[tier]}
            </Button>
          ))}
        </Flex>
      </Flex>
      <Flex
        direction="column"
        className={styles.splitFilters}
        style={{ width: '100%' }}
      >
        <Flex>
          {nations.slice(0, 5).map((nation, index) => (
            <Button
              key={nation}
              color={filters.nations.includes(nation) ? undefined : 'gray'}
              variant={filters.nations.includes(nation) ? 'surface' : 'soft'}
              style={{
                flex: 1,
                margin: -0.5,
                borderTopLeftRadius: index === 0 ? 16 : 0,
                borderBottomLeftRadius: 0,
                borderTopRightRadius:
                  index === nations.length - Math.round(nations.length / 2)
                    ? 16
                    : 0,
                borderBottomRightRadius:
                  index === nations.length - 1 ? undefined : 0,
              }}
              onClick={() =>
                mutateTankopediaPersistent((draft) => {
                  if (draft.filters.nations.includes(nation)) {
                    draft.filters.nations = draft.filters.nations.filter(
                      (preexistingType) => preexistingType !== nation,
                    );
                  } else {
                    draft.filters.nations.push(nation);
                  }
                })
              }
            >
              <Flag nation={nation} />
            </Button>
          ))}
        </Flex>

        <Flex>
          {nations.slice(5).map((nation, index) => (
            <Button
              key={nation}
              color={filters.nations.includes(nation) ? undefined : 'gray'}
              variant={filters.nations.includes(nation) ? 'surface' : 'soft'}
              style={{
                flex: 1,
                margin: -0.5,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: index === 0 ? 16 : 0,
                borderTopRightRadius:
                  index === nations.length - 1 ? undefined : 0,
                borderBottomRightRadius:
                  index === nations.length - Math.round(nations.length / 2) - 1
                    ? 16
                    : 0,
              }}
              onClick={() =>
                mutateTankopediaPersistent((draft) => {
                  if (draft.filters.nations.includes(nation)) {
                    draft.filters.nations = draft.filters.nations.filter(
                      (preexistingType) => preexistingType !== nation,
                    );
                  } else {
                    draft.filters.nations.push(nation);
                  }
                })
              }
            >
              <Flag nation={nation} />
            </Button>
          ))}
        </Flex>
      </Flex>
      <Flex className={styles.oneLineFilters}>
        {nations.map((nation, index) => (
          <Button
            key={nation}
            color={filters.nations.includes(nation) ? undefined : 'gray'}
            variant={filters.nations.includes(nation) ? 'surface' : 'soft'}
            style={{
              flex: 1,
              margin: -0.5,
              borderTopLeftRadius: index === 0 ? undefined : 0,
              borderBottomLeftRadius: index === 0 ? undefined : 0,
              borderTopRightRadius:
                index === nations.length - 1 ? undefined : 0,
              borderBottomRightRadius:
                index === nations.length - 1 ? undefined : 0,
            }}
            onClick={() =>
              mutateTankopediaPersistent((draft) => {
                if (draft.filters.nations.includes(nation)) {
                  draft.filters.nations = draft.filters.nations.filter(
                    (preexistingType) => preexistingType !== nation,
                  );
                } else {
                  draft.filters.nations.push(nation);
                }
              })
            }
          >
            <Flag nation={nation} />
          </Button>
        ))}
      </Flex>
      <Flex className={styles.oneLineFilters}>
        {[...TIERS].map((tier, index) => (
          <Button
            key={tier}
            color={filters.tiers.includes(tier) ? undefined : 'gray'}
            variant={filters.tiers.includes(tier) ? 'surface' : 'soft'}
            style={{
              flex: 1,
              margin: -0.5,
              borderTopLeftRadius: index === 0 ? undefined : 0,
              borderBottomLeftRadius: index === 0 ? undefined : 0,
              borderTopRightRadius: index === TIERS.length - 1 ? undefined : 0,
              borderBottomRightRadius:
                index === TIERS.length - 1 ? undefined : 0,
            }}
            onClick={() =>
              mutateTankopediaPersistent((draft) => {
                if (draft.filters.tiers.includes(tier)) {
                  draft.filters.tiers = draft.filters.tiers.filter(
                    (preexistingTier) => preexistingTier !== tier,
                  );
                } else {
                  draft.filters.tiers.push(tier);
                }
              })
            }
          >
            {TIER_ROMAN_NUMERALS[tier]}
          </Button>
        ))}
      </Flex>
    </Flex>
  );
}
