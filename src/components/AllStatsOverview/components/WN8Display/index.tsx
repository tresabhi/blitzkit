import { Locale } from 'discord.js';
import { Percentile } from '../../../../constants/percentiles';
import { translator } from '../../../../core/localization/translator';
import getWN8Percentile from '../../../../core/statistics/getWN8Percentile';
import { theme } from '../../../../stitches.config';
import { PERCENTILE_COLORS } from '../../../PercentileIndicator/constants';
import { Glow } from './components/Glow';

export interface WN8DisplayProps {
  wn8?: number;
  locale: Locale;
}

export function WN8Display({ wn8, locale }: WN8DisplayProps) {
  const percentile =
    wn8 === undefined ? Percentile.VeryBad : getWN8Percentile(wn8);
  const color = PERCENTILE_COLORS[percentile];
  const { translate } = translator(locale);

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
        <span
          style={{
            fontWeight: 900,
            fontSize: 32,
            color: theme.colors.textHighContrast,
          }}
        >
          {wn8 === undefined ? '--' : wn8.toFixed(0)}
        </span>
        <span
          style={{
            fontSize: 16,
            color: theme.colors.textHighContrast,
          }}
        >
          {translate(`common.wn8_percentile.${percentile}`)}
        </span>
      </div>

      <Glow color={color} direction="reverse" />
    </div>
  );
}
