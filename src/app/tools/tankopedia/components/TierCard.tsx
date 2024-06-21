import { Flex, Grid, Heading, Separator } from '@radix-ui/themes';
import { memo, useEffect, useRef } from 'react';
import {
  TankDefinition,
  Tier,
} from '../../../../core/blitzkit/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../../../../core/blitzkit/tankDefinitions/constants';
import { tankopediaFilterTank } from '../../../../core/blitzkit/tankopediaFilterTank';
import { useTankopediaFilters } from '../../../../stores/tankopediaFilters';
import { TankCard } from './TankCard';

interface TierCardProps {
  tier: Tier;
  tanks: TankDefinition[];
}

export const TierCard = memo(
  ({ tier, tanks }: TierCardProps) => {
    const container = useRef<HTMLDivElement>(null);

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
      >
        <Flex align="center" mb="4" gap="4">
          <Heading weight="regular">Tier {TIER_ROMAN_NUMERALS[tier]}</Heading>
          <Separator style={{ flex: 1 }} />
        </Flex>

        <Grid
          flexGrow="1"
          columns="repeat(auto-fill, minmax(100px, 1fr))"
          gap="2"
          gapY="6"
        >
          {tanks.map((tank) => (
            <TankCard key={tank.id} tank={tank} />
          ))}
        </Grid>
      </Flex>
    );
  },
  (prev, next) => prev.tier === next.tier,
);
