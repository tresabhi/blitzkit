import { Flex, FlexProps, Theme } from '@radix-ui/themes';
import { ComponentProps } from 'react';

type PageWrapperProps = FlexProps & {
  color?: ComponentProps<typeof Theme>['accentColor'];
  size?: number;
};

export default function PageWrapper({
  style,
  color,
  size = 800,
  ...props
}: PageWrapperProps) {
  return (
    <Theme accentColor={color}>
      <Flex
        direction="column"
        gap="4"
        style={{
          width: '100%',
          maxWidth: size,
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
