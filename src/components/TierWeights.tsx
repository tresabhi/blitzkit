import { Tier } from '../core/blitzkrieg/tankDefinitions';
import { theme } from '../stitches.config';

export type TierWeightsRecord = Partial<Record<Tier, number>>;

interface TierWeightsProps {
  weights: TierWeightsRecord;
}

export default function TierWeights({ weights }: TierWeightsProps) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {Object.entries(weights).map(([tier, weight]) => (
        <div
          key={tier}
          style={{
            backgroundColor: theme.colors.appBackground1_light,
            flex: weight,
            color: theme.colors.textHighContrast_light,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            overflow: 'hidden',
            borderRadius: 8,
            minWidth: 16,
          }}
        >
          {tier}
        </div>
      ))}
    </div>
  );
}
