import { Flex, FlexProps, Theme } from '@radix-ui/themes';
import { ComponentProps } from 'react';

type PageWrapperProps = FlexProps & {
  color?: ComponentProps<typeof Theme>['accentColor'];
  size?: number | string;
};

export default function PageWrapper({
  style,
  color,
  size = 800,
  children,
  ...props
}: PageWrapperProps) {
  return (
    <Theme
      accentColor={color}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Flex
        direction="column"
        gap="4"
        style={{
          width: '100%',
          maxWidth: size,
          margin: 'auto',
          padding: 16,
          boxSizing: 'border-box',
          flex: 1,
          ...style,
        }}
        {...props}
      >
        {children}
      </Flex>
    </Theme>
  );
}
