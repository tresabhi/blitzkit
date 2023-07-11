import { ReactNode } from 'react';
import { theme } from '../stitches.config';

export interface WrapperProps {
  children: ReactNode;
  naked?: boolean;
}

export default function Wrapper({ children, naked }: WrapperProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 16,
        gap: 32,
        width: 640,
        color: theme.colors.textHighContrast,

        ...(!naked && {
          background: 'url(https://i.imgur.com/PhS06NJ.png)',
        }),
      }}
    >
      {children}
    </div>
  );
}
