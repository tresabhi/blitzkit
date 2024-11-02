import { Theme, type ThemeProps } from '@radix-ui/themes';
import type { ReactNode } from 'react';
import './index.css';

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
      className="blitzkit-theme"
      grayColor="mauve"
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
