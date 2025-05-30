import locales from '@blitzkit/i18n/locales.json' with { type: 'json' };
import { Link, type LinkProps } from '@radix-ui/themes';
import type { LocaleAcceptorProps } from '../hooks/useLocale';

export function LinkI18n({
  localeData,
  href,
  ...props
}: LinkProps & LocaleAcceptorProps) {
  const prefix =
    localeData.locale === locales.default ? '' : `/${localeData.locale}`;

  return (
    <Link href={href?.startsWith('/') ? `${prefix}${href}` : href} {...props} />
  );
}
