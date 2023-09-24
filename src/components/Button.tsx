import { ComponentProps } from 'react';
import { theme } from '../stitches.config';

type ButtonColor = 'default' | 'dangerous' | 'recommended';

interface ButtonProps extends ComponentProps<'button'> {
  color?: ButtonColor;
}

const BUTTON_COLORS = {
  default: '',
  dangerous: '_red',
  recommended: '_blue',
} as const satisfies Record<ButtonColor, string>;

export function Button({ color, style, ...props }: ButtonProps) {
  color = color ?? 'default';

  return (
    <button
      style={{
        color: theme.colors[`textHighContrast${BUTTON_COLORS[color]}`],
        backgroundColor:
          theme.colors[`componentInteractive${BUTTON_COLORS[color]}`],
        borderRadius: 4,
        border: 'none',
        cursor: 'pointer',
        padding: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,

        ...style,
      }}
      {...props}
    />
  );
}
