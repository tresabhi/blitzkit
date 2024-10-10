import { Theme, type ThemeProps } from '@radix-ui/themes';
import type { ReactNode } from 'react';

interface BlitzKitThemeProps extends ThemeProps {
  children: ReactNode;
}

export function BlitzKitTheme({
  children,
  style,
  ...props
}: BlitzKitThemeProps) {
  return (
    <Theme
      grayColor="mauve"
      style={{ minHeight: 'unset', ...style }}
      appearance="dark"
      panelBackground="solid"
      radius="full"
      accentColor="amber"
      suppressHydrationWarning
      suppressContentEditableWarning
      {...props}
    >
      {children}
    </Theme>
  );
}
