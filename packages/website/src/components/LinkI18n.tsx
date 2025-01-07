import { Link, type LinkProps } from '@radix-ui/themes';
import { getBestLocale } from '../core/i18n/getBestLocale';
import type { LocaleAcceptorProps } from '../hooks/useLocale';

type LinkI18nProps = LinkProps & LocaleAcceptorProps;

export function LinkI18n({ locale, href, ...props }: LinkI18nProps) {
  const bestLocale = getBestLocale();
  const resolvedLocale = locale ?? bestLocale;
  const prefix = resolvedLocale === undefined ? '' : `/${resolvedLocale}`;

  return (
    <Link href={href?.startsWith('/') ? `${prefix}${href}` : href} {...props} />
  );
}
