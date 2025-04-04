import { Locale } from 'discord.js';
import { translator } from '../../core/localization/translator';
import { theme } from '../../stitches.config';

interface NoDataProps {
  type:
    | 'battles_in_period'
    | 'players_in_period'
    | 'tanks_found'
    | 'battles_in_season';
  locale: Locale;
}

export function NoData({ type, locale }: NoDataProps) {
  const { strings } = translator(locale);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ fontSize: 16, color: theme.colors.textLowContrast }}>
        {strings.bot.common.no_data[type]}
      </span>
    </div>
  );
}
