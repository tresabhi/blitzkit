'use client';

import { LinkProps, Link as RadixLink } from '@radix-ui/themes';
import { useRouter } from 'next/navigation';
import { forwardRef } from 'react';

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, onClick, ...props }, ref) => {
    const router = useRouter();

    return (
      <RadixLink
        ref={ref}
        href={href}
        onClick={(event) => {
          event.preventDefault();
          if (href) {
            if (event.ctrlKey || event.metaKey) {
              window.open(href);
            } else {
              router.push(href);
            }
          }
          onClick?.(event);
        }}
        {...props}
      />
    );
  },
);
