import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
}

export function Button({ children }: ButtonProps) {
  return (
    <button
      style={{
        padding: 16,
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
