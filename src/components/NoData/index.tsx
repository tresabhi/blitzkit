import { Locale } from 'discord.js';
import { translator } from '../../core/localization/translator';
import { theme } from '../../stitches.config';

interface NoDataProps {
  type: 'battles_in_period' | 'players_in_period' | 'tanks_found';
  locale: Locale;
}

export default function NoData({ type, locale }: NoDataProps) {
  const { translate } = translator(locale);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ fontSize: 16, color: theme.colors.textLowContrast }}>
        {translate(`bot.common.no_data.${type}`)}
      </span>
    </div>
  );
}
