import { ReactNode } from 'react';
import { theme } from '../stitches.config';

export interface WrapperProps {
  children: ReactNode;
  naked?: boolean;
  fat?: boolean;
}

export default function Wrapper({ children, naked, fat }: WrapperProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: `16px ${fat ? 0 : 16}px`,
        gap: 32,
        width: 480,
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
