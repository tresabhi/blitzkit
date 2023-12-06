'use client';

import { CaretDownIcon } from '@radix-ui/react-icons';
import { Button, DropdownMenu, Flex } from '@radix-ui/themes';
import { use } from 'react';
import {
  TANK_TYPES,
  TREE_TYPES,
  TREE_TYPE_ICONS,
  TREE_TYPE_IMAGES,
  TreeTypeEnum,
} from '../../../../components/Tanks';
import { asset } from '../../../../core/blitzkrieg/asset';
import {
  NATIONS,
  TIERS,
  TIER_ROMAN_NUMERALS,
} from '../../../../core/blitzkrieg/definitions/tanks';
import mutateTankopedia, {
  TankopediaSortBy,
  TankopediaSortDirection,
  TankopediaTestTankDisplay,
  useTankopedia,
} from '../../../../stores/tankopedia';

export function Options() {
  const nations = use(NATIONS);
  const tankopediaState = useTankopedia();

  return (
    <Flex justify="center" wrap="wrap" gap="2">
      <Flex gap="1">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="soft">
              Sort by
              <CaretDownIcon />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.RadioGroup
              value={tankopediaState.sort.by}
              onValueChange={(value) =>
                mutateTankopedia((draft) => {
                  draft.sort.by = value as TankopediaSortBy;
                })
              }
            >
              <DropdownMenu.RadioItem value="tier">Tier</DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem value="name">Name</DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="soft">
              Sort order
              <CaretDownIcon />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.RadioGroup
              value={tankopediaState.sort.direction}
              onValueChange={(value) =>
                mutateTankopedia((draft) => {
                  draft.sort.direction = value as TankopediaSortDirection;
                })
              }
            >
              <DropdownMenu.RadioItem value="ascending">
                Ascending
              </DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem value="descending">
                Descending
              </DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>

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

      <Flex>
        {[...TIERS].reverse().map((tier, index) => (
          <Button
            key={tier}
            variant={
              tankopediaState.filters.tiers.includes(tier) ? 'solid' : 'soft'
            }
            style={{
              margin: -0.5,
              borderTopLeftRadius: index === 0 ? undefined : 0,
              borderBottomLeftRadius: index === 0 ? undefined : 0,
              borderTopRightRadius: index === TIERS.length - 1 ? undefined : 0,
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

      <Flex>
        {[...TANK_TYPES].reverse().map((type, index) => (
          <Button
            key={type}
            variant={
              tankopediaState.filters.types.includes(type) ? 'solid' : 'soft'
            }
            style={{
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

      <Flex>
        {nations.map((nation, index) => (
          <Button
            key={nation}
            variant={
              tankopediaState.filters.nations.includes(nation)
                ? 'solid'
                : 'soft'
            }
            style={{
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
            <img
              src={asset(`flags/circle/${nation}.webp`)}
              style={{
                width: '1em',
                height: '1em',
                scale: 2,
                transform: 'translate(15%, 15%)',
              }}
            />
          </Button>
        ))}
      </Flex>

      <Flex>
        {TREE_TYPES.map((type, index) => (
          <Button
            key={type}
            variant={
              tankopediaState.filters.treeTypes.includes(type)
                ? 'solid'
                : 'soft'
            }
            style={{
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
    </Flex>
  );
}
