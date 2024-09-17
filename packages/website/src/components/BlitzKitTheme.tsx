import { Theme } from '@radix-ui/themes';
import type { ReactNode } from 'react';

interface BlitzKitThemeProps {
  children: ReactNode;
}

export function BlitzKitTheme({ children }: BlitzKitThemeProps) {
  return (
    <Theme
      style={{ minHeight: 'unset' }}
      appearance="dark"
      panelBackground="solid"
      radius="full"
      accentColor="amber"
      suppressHydrationWarning
      suppressContentEditableWarning
    >
      {children}
    </Theme>
  );
}
