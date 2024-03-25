import { ReactNode } from 'react';
import { theme } from '../stitches.config';

interface CommandWrapperProps {
  children: ReactNode;
  fat?: boolean;
}

export default function CommandWrapper({ children, fat }: CommandWrapperProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: `16px ${fat ? 0 : 16}px`,
        gap: 16,
        width: 480,
        color: theme.colors.textHighContrast,
        position: 'relative',
        background: `linear-gradient(${theme.colors.appBackground2}, ${theme.colors.appBackground1})`,
      }}
    >
      {children}
    </div>
  );
}
