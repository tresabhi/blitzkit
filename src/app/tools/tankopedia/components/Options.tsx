'use client';

import { CaretDownIcon } from '@radix-ui/react-icons';
import { Button, DropdownMenu, Flex } from '@radix-ui/themes';
import {
  TANK_TYPES,
  TREE_TYPES,
  TREE_TYPE_ICONS,
  TREE_TYPE_IMAGES,
  TreeTypeEnum,
} from '../../../../components/Tanks';
import {
  TIERS,
  TIER_ROMAN_NUMERALS,
} from '../../../../core/blitzkrieg/tankopedia';
import mutateTankopedia, {
  TankopediaSortBy,
  TankopediaSortDirection,
  useTankopedia,
} from '../../../../stores/tankopedia';

export function Options() {
  const tankopediaState = useTankopedia();

  return (
    <Flex justify="center" wrap="wrap" gap="4">
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

      <Flex>
        {TIERS.toReversed().map((tier, index) => (
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
        {TANK_TYPES.toReversed().map((type, index) => (
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
    </Flex>
  );
}
