import { Theme, type ThemeProps } from '@radix-ui/themes';
import type { ReactNode } from 'react';

interface BlitzKitThemeProps extends ThemeProps {
  children: ReactNode;
}

export function BlitzKitTheme({ children, ...props }: BlitzKitThemeProps) {
  return (
    <Theme
      style={{ minHeight: 'unset' }}
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
