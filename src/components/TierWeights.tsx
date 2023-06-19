import { TIER_ROMAN_NUMERALS, Tier } from '../core/blitz/tankopedia.js';
import { themeLight } from '../stitches.config.js';

export type TierWeightsRecord = Partial<Record<Tier, number>>;

export interface TierWeightsProps {
  weights: TierWeightsRecord;
}

export default function TierWeights({ weights }: TierWeightsProps) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {Object.entries(weights).map(([tier, weight]) => (
        <div
          key={tier}
          style={{
            backgroundColor: themeLight.colors.appBackground1,
            flex: weight,
            color: themeLight.colors.textHighContrast,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            overflow: 'hidden',
            borderRadius: 8,
            minWidth: 16,
          }}
        >
          {TIER_ROMAN_NUMERALS[parseInt(tier) as Tier]}
        </div>
      ))}
    </div>
  );
}
