import { Link, type LinkProps } from '@radix-ui/themes';
import { getBestLocale } from '../core/i18n/getBestLocale';

type LinkI18nProps = LinkProps & {
  locale: string | undefined;
};

export function LinkI18n({ locale, href, ...props }: LinkI18nProps) {
  const bestLocale = getBestLocale();
  const resolvedLocale = locale ?? bestLocale;
  const prefix = resolvedLocale === undefined ? '' : `/${resolvedLocale}`;

  return (
    <Link href={href?.startsWith('/') ? `${prefix}${href}` : href} {...props} />
  );
}
