import { Flex, Heading } from '@radix-ui/themes';
import { useLocale } from '../../../../../../hooks/useLocale';
import type { StatsAcceptorProps } from './HullTraverseVisualizer';
import { Info } from './Info';
import { InfoWithDelta } from './InfoWithDelta';
import { ViewRangeVisualizer } from './ViewRangeVisualizer';

export function Survivability({ stats }: StatsAcceptorProps) {
  const { strings } = useLocale();

  return (
    <Flex direction="column" gap="2" width="16rem">
      <Heading size="5">
        {strings.website.tools.tankopedia.survivability.title}
      </Heading>
      <InfoWithDelta value="health" stats={stats} unit="hp" decimals={0} />
      <InfoWithDelta
        stats={stats}
        name={
          strings.website.tools.tankopedia.characteristics.values.fireChance
        }
        unit="%"
        deltaType="lowerIsBetter"
        decimals={0}
        value={(stats) => stats.fireChance * 100}
      />
      <InfoWithDelta value="viewRange" stats={stats} unit="m" decimals={0} />
      <ViewRangeVisualizer stats={stats} />
      <Info
        name={
          strings.website.tools.tankopedia.characteristics.values.camouflage
        }
        unit="%"
      />
      <InfoWithDelta
        value={(stats) => stats.camouflageStill * 100}
        stats={stats}
        indent
        name={
          strings.website.tools.tankopedia.characteristics.values
            .camouflageStill
        }
        decimals={2}
      />
      <InfoWithDelta
        value={(stats) => stats.camouflageMoving * 100}
        stats={stats}
        indent
        name={
          strings.website.tools.tankopedia.characteristics.values
            .camouflageMoving
        }
        decimals={2}
      />
      <InfoWithDelta
        stats={stats}
        indent
        name={
          strings.website.tools.tankopedia.characteristics.values
            .camouflageShootingStill
        }
        decimals={2}
        value={(stats) => stats.camouflageShootingStill * 100}
      />
      <InfoWithDelta
        stats={stats}
        indent
        name={
          strings.website.tools.tankopedia.characteristics.values
            .camouflageShootingMoving
        }
        decimals={2}
        value={(stats) => stats.camouflageShootingMoving * 100}
      />
      <InfoWithDelta
        stats={stats}
        indent
        name={
          strings.website.tools.tankopedia.characteristics.values
            .camouflageCaughtOnFire
        }
        decimals={2}
        value={(stats) => stats.camouflageCaughtOnFire * 100}
      />
      <InfoWithDelta
        unit="m"
        decimals={0}
        deltaType="lowerIsBetter"
        stats={stats}
        value="width"
      />
      <InfoWithDelta
        unit="m"
        decimals={0}
        deltaType="lowerIsBetter"
        stats={stats}
        value="height"
      />
      <InfoWithDelta
        unit="m"
        decimals={0}
        deltaType="lowerIsBetter"
        stats={stats}
        value="length"
      />
      <InfoWithDelta
        unit="m"
        decimals={0}
        deltaType="lowerIsBetter"
        stats={stats}
        value="volume"
      />
    </Flex>
  );
}
