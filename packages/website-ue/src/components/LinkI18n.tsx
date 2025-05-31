import locales from '@blitzkit/i18n/locales.json' with { type: 'json' };
import { Link, type LinkProps } from '@radix-ui/themes';

export function LinkI18n({
  locale,
  href,
  ...props
}: LinkProps & { locale: string }) {
  const prefix = locale === locales.default ? '' : `/${locale}`;

  return (
    <Link href={href?.startsWith('/') ? `${prefix}${href}` : href} {...props} />
  );
}
