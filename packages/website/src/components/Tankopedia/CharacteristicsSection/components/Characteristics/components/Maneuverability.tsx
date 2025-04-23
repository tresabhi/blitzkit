import { Flex, Heading } from '@radix-ui/themes';
import { useLocale } from '../../../../../../hooks/useLocale';
import {
  HullTraverseVisualizer,
  type StatsAcceptorProps,
} from './HullTraverseVisualizer';
import { Info } from './Info';
import { InfoWithDelta } from './InfoWithDelta';

export function Maneuverability({ stats }: StatsAcceptorProps) {
  const { strings } = useLocale();

  return (
    <Flex direction="column" gap="2" width="16rem">
      <Heading size="5">
        {strings.website.tools.tankopedia.maneuverability.title}
      </Heading>
      <Info
        name={strings.website.tools.tankopedia.characteristics.values.speed}
        unit="kph"
      />
      <InfoWithDelta value="speedForwards" stats={stats} decimals={0} indent />
      <InfoWithDelta value="speedBackwards" stats={stats} decimals={0} indent />
      <InfoWithDelta stats={stats} decimals={0} value="enginePower" />
      <InfoWithDelta
        stats={stats}
        decimals={1}
        unit="tn"
        deltaType="lowerIsBetter"
        value="weight"
      />
      <Info
        name={
          strings.website.tools.tankopedia.characteristics.values
            .terrain_coefficients
        }
      />
      <InfoWithDelta
        value="hardTerrainCoefficient"
        stats={stats}
        decimals={0}
        unit="%"
        indent
      />
      <InfoWithDelta
        stats={stats}
        decimals={0}
        unit="%"
        indent
        value="mediumTerrainCoefficient"
      />
      <InfoWithDelta
        value="softTerrainCoefficient"
        stats={stats}
        decimals={0}
        unit="%"
        indent
      />
      <Info
        name={
          strings.website.tools.tankopedia.characteristics.values
            .raw_terrain_coefficients
        }
        deltaType="lowerIsBetter"
      />
      <InfoWithDelta
        value="hardTerrainCoefficientRaw"
        stats={stats}
        decimals={2}
        unit="%"
        indent
        deltaType="lowerIsBetter"
      />
      <InfoWithDelta
        stats={stats}
        decimals={2}
        unit="%"
        indent
        deltaType="lowerIsBetter"
        value="mediumTerrainCoefficientRaw"
      />
      <InfoWithDelta
        stats={stats}
        decimals={2}
        unit="%"
        indent
        deltaType="lowerIsBetter"
        value="softTerrainCoefficientRaw"
      />
      <Info
        name={
          strings.website.tools.tankopedia.characteristics.values
            .power_to_weight_ratio
        }
        unit="hp/tn"
      />
      <InfoWithDelta
        stats={stats}
        decimals={1}
        indent
        value="powerToWeightRatioHardTerrain"
      />
      <InfoWithDelta
        stats={stats}
        decimals={1}
        indent
        value="powerToWeightRatioMediumTerrain"
      />
      <InfoWithDelta
        stats={stats}
        decimals={1}
        indent
        value="powerToWeightRatioSoftTerrain"
      />
      <InfoWithDelta
        stats={stats}
        unit="°/s"
        decimals={1}
        value="turretTraverseSpeed"
      />
      <Info
        name={
          strings.website.tools.tankopedia.characteristics.values
            .hull_traverse_speed
        }
        unit="°/s"
      />
      <InfoWithDelta
        stats={stats}
        decimals={1}
        indent
        value="hullTraverseHardTerrain"
      />
      <InfoWithDelta
        stats={stats}
        decimals={1}
        indent
        value="hullTraverseMediumTerrain"
      />
      <InfoWithDelta
        stats={stats}
        decimals={1}
        indent
        value="hullTraverseSoftTerrain"
      />

      <HullTraverseVisualizer stats={stats} />
    </Flex>
  );
}
