import { ReactNode } from 'react';
import { theme } from '../../../stitches.config';

interface ButtonProps {
  children: ReactNode;
}

export function Button({ children }: ButtonProps) {
  return (
    <button
      style={{
        padding: theme.spaces.paddingMajor,
        border: 'none',
        cursor: 'pointer',
        background: 'none',
        color: 'inherit',
      }}
    >
      {children}
    </button>
  );
}
