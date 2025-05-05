import {
  Badge,
  Button,
  Flex,
  type ButtonProps,
  type FlexProps,
} from '@radix-ui/themes';
import type { ReactNode } from 'react';

function Root(props: FlexProps) {
  return <Flex direction="column" gap="2" width="100%" {...props} />;
}

interface ItemProps extends ButtonProps {
  text: string;
  discriminator?: ReactNode;
}

function Item({ text, discriminator, ...props }: ItemProps) {
  return (
    <Button variant="ghost" {...props} highContrast>
      <Flex
        justify={discriminator === undefined ? 'center' : 'between'}
        width="100%"
        gap="2"
      >
        {text}
        {discriminator !== undefined && <Badge>{discriminator}</Badge>}
      </Flex>
    </Button>
  );
}

export const SearchResults = { Root, Item };
