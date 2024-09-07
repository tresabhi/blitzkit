import { Flex, IconButton, Text } from '@radix-ui/themes';
import { times } from 'lodash';
import { memo } from 'react';
import { Tier } from '../../../../core/blitzkit/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../../../../core/blitzkit/tankDefinitions/constants';
import * as TankFilters from '../../../../stores/tankFilters';
import * as TankopediaSort from '../../../../stores/tankopediaSort';

export const TierFilter = memo(() => {
  const tierFilter = TankFilters.use((state) => state.tiers);
  const sort = TankopediaSort.use();
  const search = TankFilters.use((state) => state.search);
  const mutateTankFilters = TankFilters.useMutation();

  if (sort.by !== 'meta.none' || search) return null;

  return (
    <Flex justify="center">
      <Flex
        direction="row"
        overflow="hidden"
        style={{ borderRadius: 'var(--radius-full)' }}
      >
        {times(10, (index) => {
          const tier = (10 - index) as Tier;
          const selected = tierFilter.includes(tier);

          return (
            <IconButton
              key={tier}
              variant={selected ? 'solid' : 'soft'}
              radius="none"
              color={selected ? undefined : 'gray'}
              highContrast
              onClick={() =>
                mutateTankFilters((draft) => {
                  if (draft.tiers?.includes(tier)) {
                    draft.tiers = draft.tiers?.filter((t) => t !== tier);
                  } else {
                    draft.tiers = [...(draft.tiers ?? []), tier];
                  }
                })
              }
            >
              <Text size="2">{TIER_ROMAN_NUMERALS[tier]}</Text>
            </IconButton>
          );
        })}
      </Flex>
    </Flex>
  );
});
