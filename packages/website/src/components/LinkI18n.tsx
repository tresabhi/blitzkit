import { DEFAULT_LOCALE } from '@blitzkit/core';
import { Link, type LinkProps } from '@radix-ui/themes';
import type { LocaleAcceptorProps } from '../hooks/useLocale';

type LinkI18nProps = LinkProps & LocaleAcceptorProps;

export function LinkI18n({ locale, href, ...props }: LinkI18nProps) {
  const prefix =
    locale === undefined || locale === DEFAULT_LOCALE ? '' : `/${locale}`;

  return (
    <Link href={href?.startsWith('/') ? `${prefix}${href}` : href} {...props} />
  );
}
