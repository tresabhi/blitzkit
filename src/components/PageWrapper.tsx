import { Flex, Theme } from '@radix-ui/themes';
import { ComponentProps } from 'react';

interface PageWrapperProps extends ComponentProps<typeof Flex> {
  color?: ComponentProps<typeof Theme>['accentColor'];
}

export default function PageWrapper({
  style,
  color,
  ...props
}: PageWrapperProps) {
  return (
    <Theme accentColor={color}>
      <Flex
        {...props}
        direction="column"
        gap="4"
        style={{
          width: '100%',
          maxWidth: 800,
          margin: 'auto',
          padding: 16,
          boxSizing: 'border-box',

          ...style,
        }}
      />
    </Theme>
  );
}
