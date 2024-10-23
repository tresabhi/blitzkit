import { theme } from '../../../stitches.config';

interface TitleProps {
  children: string;
}

export function Title({ children }: TitleProps) {
  return (
    <span
      style={{
        fontWeight: 900,
        color: theme.colors.textHighContrast,
        fontSize: 24,
      }}
    >
      {children}
    </span>
  );
}
