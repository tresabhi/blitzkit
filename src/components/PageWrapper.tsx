import { Flex, Theme } from '@radix-ui/themes';
import { ComponentProps } from 'react';

interface PageWrapperProps extends ComponentProps<typeof Flex> {
  color?: ComponentProps<typeof Theme>['accentColor'];
  size?: 'regular' | 'wide' | 'double';
}

export default function PageWrapper({
  style,
  color,
  size = 'regular',
  ...props
}: PageWrapperProps) {
  return (
    <Theme accentColor={color}>
      <Flex
        direction="column"
        gap="4"
        style={{
          width: '100%',
          maxWidth: size === 'regular' ? 800 : size === 'double' ? 1200 : 960,
          margin: 'auto',
          padding: 16,
          boxSizing: 'border-box',

          ...style,
        }}
        {...props}
      />
    </Theme>
  );
}
