'use client';

import {
  Link as RadixLink,
  LinkProps as RadixLinkProps,
} from '@radix-ui/themes';
import { useRouter } from 'next/navigation';
import { forwardRef } from 'react';

type LinkProps = RadixLinkProps & {
  disabled?: boolean;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, onClick, target, disabled, style, ...props }, ref) => {
    const router = useRouter();

    return (
      <RadixLink
        style={{
          cursor: disabled ? 'not-allowed' : 'pointer',
          ...style,
        }}
        ref={ref}
        href={disabled ? undefined : href}
        onClick={(event) => {
          if (disabled) return;

          event.preventDefault();

          if (href) {
            if (event.ctrlKey || event.metaKey || target === '_blank') {
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
