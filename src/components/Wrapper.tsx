import { ReactNode } from 'react';
import { theme } from '../stitches.config.js';

export interface WrapperProps {
  children: ReactNode;
}

export default function Wrapper({ children }: WrapperProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 16,
        gap: 32,
        width: 640,
        backgroundColor: theme.colors.appBackground1,
        color: theme.colors.textHighContrast,
      }}
    >
      {children}
    </div>
  );
}
