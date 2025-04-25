import { Heading } from '@radix-ui/themes';
import { useLocale } from '../../../../../../hooks/useLocale';
import {
  HullTraverseVisualizer,
  type StatsAcceptorProps,
} from './HullTraverseVisualizer';
import { Info } from './Info';
import { InfoWithDelta } from './InfoWithDelta';
import { StatsTableWrapper } from './StatsTableWrapper';

export function Maneuverability({ stats }: StatsAcceptorProps) {
  const { strings } = useLocale();

  return (
    <StatsTableWrapper>
      <Heading size="5">
        {strings.website.tools.tankopedia.maneuverability.title}
      </Heading>
      <Info
        name={strings.website.tools.tankopedia.characteristics.values.speed}
      />
      <InfoWithDelta value="speedForwards" stats={stats} decimals={0} indent />
      <InfoWithDelta value="speedBackwards" stats={stats} decimals={0} indent />
      <InfoWithDelta stats={stats} decimals={0} value="enginePower" />
      <InfoWithDelta
        stats={stats}
        decimals={1}
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
        indent
      />
      <InfoWithDelta
        stats={stats}
        decimals={0}
        indent
        value="mediumTerrainCoefficient"
      />
      <InfoWithDelta
        value="softTerrainCoefficient"
        stats={stats}
        decimals={0}
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
        indent
        deltaType="lowerIsBetter"
      />
      <InfoWithDelta
        stats={stats}
        decimals={2}
        indent
        deltaType="lowerIsBetter"
        value="mediumTerrainCoefficientRaw"
      />
      <InfoWithDelta
        stats={stats}
        decimals={2}
        indent
        deltaType="lowerIsBetter"
        value="softTerrainCoefficientRaw"
      />
      <Info
        name={
          strings.website.tools.tankopedia.characteristics.values
            .power_to_weight_ratio
        }
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
      <InfoWithDelta stats={stats} decimals={1} value="turretTraverseSpeed" />
      <Info
        name={
          strings.website.tools.tankopedia.characteristics.values
            .hull_traverse_speed
        }
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
    </StatsTableWrapper>
  );
}
