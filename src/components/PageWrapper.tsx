import { Flex, FlexProps, Theme } from '@radix-ui/themes';
import { ComponentProps } from 'react';
import { theme } from '../stitches.config';

type PageWrapperProps = FlexProps & {
  color?: ComponentProps<typeof Theme>['accentColor'];
  size?: number | string;
  noPadding?: boolean;
  noMaxWidth?: boolean;
  highlight?: boolean;
};

export default function PageWrapper({
  style,
  color,
  size = 800,
  children,
  noPadding = false,
  noMaxWidth = false,
  highlight = false,
  ...props
}: PageWrapperProps) {
  return (
    <Theme
      accentColor={color}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: highlight
          ? `linear-gradient(-90deg, ${theme.colors.appBackground1}, ${theme.colors.appBackground2})`
          : undefined,
      }}
    >
      <Flex
        direction="column"
        gap="4"
        style={{
          width: '100%',
          maxWidth: noMaxWidth ? undefined : size,
          margin: 'auto',
          padding: noPadding ? 0 : 16,
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
