'use client';

import { CaretDownIcon } from '@radix-ui/react-icons';
import { Button, DropdownMenu, Flex } from '@radix-ui/themes';
import { use } from 'react';
import { Flag } from '../../../../../components/Flag';
import {
  TANK_TYPES,
  TREE_TYPES,
  TREE_TYPE_ICONS,
  TREE_TYPE_IMAGES,
  TreeTypeEnum,
} from '../../../../../components/Tanks';
import {
  NATIONS,
  TIERS,
  TIER_ROMAN_NUMERALS,
} from '../../../../../core/blitzkrieg/definitions/tanks';
import mutateTankopedia, {
  TankopediaTestTankDisplay,
  useTankopedia,
} from '../../../../../stores/tankopedia';
import * as styles from './index.css';

export function Options() {
  const nations = use(NATIONS);
  const tankopediaState = useTankopedia();

  return (
    <Flex justify="center" direction="column" gap="2">
      <Flex gap="2" style={{ flex: 1 }} wrap="wrap">
        <Button
          color="red"
          onClick={() =>
            useTankopedia.setState({
              filters: {
                nations: [],
                tiers: [],
                treeTypes: [],
                types: [],
                test: 'include',
              },
            })
          }
        >
          Clear
        </Button>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="soft">
              Test tanks
              <CaretDownIcon />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.RadioGroup
              value={tankopediaState.filters.test}
              onValueChange={(value) =>
                mutateTankopedia((draft) => {
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
        <Flex style={{ flex: 1 }}>
          {TREE_TYPES.map((type, index) => (
            <Button
              key={type}
              variant={
                tankopediaState.filters.treeTypes.includes(type)
                  ? 'solid'
                  : 'soft'
              }
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
                mutateTankopedia((draft) => {
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
        <Flex style={{ flex: 1 }}>
          {[...TANK_TYPES].reverse().map((type, index) => (
            <Button
              key={type}
              variant={
                tankopediaState.filters.types.includes(type) ? 'solid' : 'soft'
              }
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
                mutateTankopedia((draft) => {
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
                src={TREE_TYPE_ICONS[TreeTypeEnum.TechTree][type]}
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
            {[...TIERS]
              .reverse()
              .slice(0, 5)
              .map((tier, index) => (
                <Button
                  key={tier}
                  variant={
                    tankopediaState.filters.tiers.includes(tier)
                      ? 'solid'
                      : 'soft'
                  }
                  style={{
                    flex: 1,
                    margin: -0.5,
                    borderTopLeftRadius: index === 0 ? undefined : 0,
                    borderBottomLeftRadius: 0,
                    borderTopRightRadius:
                      index === TIERS.length - Math.round(TIERS.length / 2) - 1
                        ? undefined
                        : 0,
                    borderBottomRightRadius: 0,
                  }}
                  onClick={() =>
                    mutateTankopedia((draft) => {
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
            {[...TIERS]
              .reverse()
              .slice(5, 10)
              .map((tier, index) => (
                <Button
                  key={tier}
                  variant={
                    tankopediaState.filters.tiers.includes(tier)
                      ? 'solid'
                      : 'soft'
                  }
                  style={{
                    flex: 1,
                    margin: -0.5,
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: index === 0 ? undefined : 0,
                    borderTopRightRadius: 0,
                    borderBottomRightRadius:
                      index === TIERS.length - Math.round(TIERS.length / 2) - 1
                        ? undefined
                        : 0,
                  }}
                  onClick={() =>
                    mutateTankopedia((draft) => {
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
                variant={
                  tankopediaState.filters.nations.includes(nation)
                    ? 'solid'
                    : 'soft'
                }
                style={{
                  flex: 1,
                  margin: -0.5,
                  borderTopLeftRadius: index === 0 ? undefined : 0,
                  borderBottomLeftRadius: 0,
                  borderTopRightRadius:
                    index === nations.length - Math.round(nations.length / 2)
                      ? undefined
                      : 0,
                  borderBottomRightRadius:
                    index === nations.length - 1 ? undefined : 0,
                }}
                onClick={() =>
                  mutateTankopedia((draft) => {
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
            {nations.slice(5, 10).map((nation, index) => (
              <Button
                key={nation}
                variant={
                  tankopediaState.filters.nations.includes(nation)
                    ? 'solid'
                    : 'soft'
                }
                style={{
                  flex: 1,
                  margin: -0.5,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: index === 0 ? undefined : 0,
                  borderTopRightRadius:
                    index === nations.length - 1 ? undefined : 0,
                  borderBottomRightRadius:
                    index ===
                    nations.length - Math.round(nations.length / 2) - 1
                      ? undefined
                      : 0,
                }}
                onClick={() =>
                  mutateTankopedia((draft) => {
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
      </Flex>

      <Flex gap="2" style={{ flex: 1 }} wrap="wrap">
        <Flex className={styles.oneLineFilters} style={{ flex: 1 }}>
          {[...TIERS].reverse().map((tier, index) => (
            <Button
              key={tier}
              variant={
                tankopediaState.filters.tiers.includes(tier) ? 'solid' : 'soft'
              }
              style={{
                flex: 1,
                margin: -0.5,
                borderTopLeftRadius: index === 0 ? undefined : 0,
                borderBottomLeftRadius: index === 0 ? undefined : 0,
                borderTopRightRadius:
                  index === TIERS.length - 1 ? undefined : 0,
                borderBottomRightRadius:
                  index === TIERS.length - 1 ? undefined : 0,
              }}
              onClick={() =>
                mutateTankopedia((draft) => {
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
        <Flex className={styles.oneLineFilters} style={{ flex: 1 }}>
          {nations.map((nation, index) => (
            <Button
              key={nation}
              variant={
                tankopediaState.filters.nations.includes(nation)
                  ? 'solid'
                  : 'soft'
              }
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
                mutateTankopedia((draft) => {
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
    </Flex>
  );
}
