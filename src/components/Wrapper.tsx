import { ReactNode } from 'react';
import { theme } from '../stitches.config.js';

export enum WrapperSize {
  Regular,
  Roomy,
}

export interface WrapperProps {
  children: ReactNode;
  size?: WrapperSize;
}

export const WRAPPER_SIZE_WIDTHS: Record<WrapperSize, number> = {
  [WrapperSize.Regular]: 640,
  [WrapperSize.Roomy]: 800,
};

export default function Wrapper({
  children,
  size = WrapperSize.Regular,
}: WrapperProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 16,
        gap: 32,
        width: WRAPPER_SIZE_WIDTHS[size],
        background: 'url(https://i.imgur.com/PhS06NJ.png)',
        color: theme.colors.textHighContrast,
      }}
    >
      {children}
    </div>
  );
}
