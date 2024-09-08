import { Flex, FlexProps, Theme } from '@radix-ui/themes';
import { ComponentProps } from 'react';
import { RadixSize } from '../stores/embedState';

type PageWrapperProps = FlexProps & {
  color?: ComponentProps<typeof Theme>['accentColor'];
  size?: number | string;
  noMaxWidth?: boolean;
  containerProps?: ComponentProps<typeof Theme>;
  noFlex1?: boolean;
  padding?: RadixSize;
};

export function PageWrapper({
  style,
  color,
  size = 800,
  children,
  noMaxWidth = false,
  noFlex1 = false,
  containerProps,
  padding = '4',
  ...props
}: PageWrapperProps) {
  return (
    <Theme
      accentColor={color}
      style={{
        flex: noFlex1 ? undefined : 1,
        display: 'flex',
        flexDirection: 'column',
        ...containerProps?.style,
      }}
      {...containerProps}
    >
      <Flex
        direction="column"
        gap="4"
        p={padding}
        style={{
          width: '100%',
          maxWidth: noMaxWidth ? undefined : size,
          margin: 'auto',
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
