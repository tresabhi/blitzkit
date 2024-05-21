import {
  Link as RadixLink,
  LinkProps as RadixLinkProps,
} from '@radix-ui/themes';
import NextLink from 'next/link';

interface LinkProps extends RadixLinkProps {
  href: string;
}

export function Link({ href, children, target, onClick, ...props }: LinkProps) {
  return (
    <RadixLink
      href={href}
      onClick={(event) => event.preventDefault()}
      {...props}
    >
      <NextLink
        tabIndex={-1}
        href={href}
        target={target}
        onClick={onClick}
        style={{ all: 'inherit' }}
      >
        {children}
      </NextLink>
    </RadixLink>
  );
}
