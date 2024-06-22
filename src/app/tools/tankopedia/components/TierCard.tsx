import { Flex, Heading, Separator } from '@radix-ui/themes';
import { memo, use, useEffect, useMemo, useRef } from 'react';
import {
  Tier,
  tanksDefinitionsArray,
} from '../../../../core/blitzkit/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../../../../core/blitzkit/tankDefinitions/constants';
import { tankopediaFilterTank } from '../../../../core/blitzkit/tankopediaFilterTank';
import { useTankopediaFilters } from '../../../../stores/tankopediaFilters';
import { TankCard } from './TankCard';
import { TankCardWrapper } from './TankCardWrapper';

interface TierCardProps {
  tier: Tier;
}

export const TierCard = memo(
  ({ tier }: TierCardProps) => {
    const awaitedTanksDefinitionsArray = use(tanksDefinitionsArray);
    const container = useRef<HTMLDivElement>(null);
    const tanks = useMemo(
      () => awaitedTanksDefinitionsArray.filter((tank) => tank.tier === tier),
      [tier],
    );

    useEffect(() => {
      const unsubscribe = useTankopediaFilters.subscribe((filters) => {
        if (!container.current) return;

        const visible = tanks.some((tank) =>
          tankopediaFilterTank(filters, tank),
        );
        container.current.style.display = visible ? 'flex' : 'none';
      });

      return unsubscribe;
    }, []);

    return (
      <Flex
        ref={container}
        direction="column"
        gap="4"
        display={tanks.length === 0 ? 'none' : 'flex'}
        py="4"
      >
        <Flex align="center" mb="4" gap="4">
          <Heading weight="regular">Tier {TIER_ROMAN_NUMERALS[tier]}</Heading>
          <Separator style={{ flex: 1 }} />
        </Flex>

        <TankCardWrapper>
          {tanks.map((tank) => (
            <TankCard key={tank.id} tank={tank} />
          ))}
        </TankCardWrapper>
      </Flex>
    );
  },
  (prev, next) => prev.tier === next.tier,
);
