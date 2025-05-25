import { DEFAULT_LOCALE } from '@blitzkit/i18n';
import { Link, type LinkProps } from '@radix-ui/themes';

type LinkI18nProps = LinkProps & {
  locale: string;
};

export function LinkI18n({ locale, href, ...props }: LinkI18nProps) {
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;

  return (
    <Link href={href?.startsWith('/') ? `${prefix}${href}` : href} {...props} />
  );
}
