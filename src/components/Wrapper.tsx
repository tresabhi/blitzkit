import { ReactNode } from 'react';

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
        background: 'black',
        color: 'white',
      }}
    >
      {children}
    </div>
  );
}
