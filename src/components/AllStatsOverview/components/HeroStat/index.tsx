import { Locale } from 'discord.js';
import { Percentile } from '../../../../constants/percentiles';
import { SupplementaryStats } from '../../../../core/blitz/getAccountInfo';
import { translator } from '../../../../core/localization/translator';
import getWN8Percentile from '../../../../core/statistics/getWN8Percentile';
import { theme } from '../../../../stitches.config';
import { PERCENTILE_COLORS } from '../../../PercentileIndicator/constants';
import { Glow } from './components/Glow';

export interface WN8DisplayProps {
  stats: SupplementaryStats;
  locale: Locale;
}

export function HeroStat({ stats, locale }: WN8DisplayProps) {
  const { translate } = translator(locale);

  const percentile =
    stats.WN8 === undefined ? Percentile.VeryBad : getWN8Percentile(stats.WN8);
  const color = PERCENTILE_COLORS[percentile];
  const heroStat = stats.WN8 === undefined ? '--' : stats.WN8.toFixed(0);
  const subtitle = translate(`common.wn8_percentile.${percentile}`);

  return (
    <div
      style={{
        width: 128 * 2, // idk why twice the width turns into the correct width
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: -16,
      }}
    >
      <Glow color={color} />

      <div
        style={{
          width: 128,
          height: 80,
          backgroundColor: color,
          borderRadius: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: -4,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontWeight: 900,
              fontSize: 32,
              color: theme.colors.textHighContrast,
            }}
          >
            {heroStat}
          </span>
          <span
            style={{
              fontSize: 16,
              color: theme.colors.textHighContrast,
            }}
          >
            {subtitle}
          </span>
        </div>
      </div>

      <Glow color={color} direction="reverse" />
    </div>
  );
}
