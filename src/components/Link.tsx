'use client';

import { LinkProps } from '@radix-ui/themes';
import { useRouter } from 'next/navigation';

export function Link({ href, onClick, ...props }: LinkProps) {
  const router = useRouter();

  return (
    <Link
      href={href}
      onClick={(event) => {
        event.preventDefault();
        if (href) router.push(href);
        onClick?.(event);
      }}
      {...props}
    />
  );
}
