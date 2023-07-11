import { theme } from '../../../stitches.config';

export interface RowDiscriminatorProps {
  name: string;
  icon?: string;
  minimized: boolean;
}

export function RowDiscriminator({
  name,
  icon,
  minimized,
}: RowDiscriminatorProps) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
        width: 0,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {!minimized && icon && (
        <img
          src={icon}
          height={0}
          style={{ flex: 1, width: '100%', objectFit: 'contain' }}
        />
      )}

      <span
        style={{
          color: theme.colors.textLowContrast,
          fontSize: 16,
          textAlign: 'center',
          display: 'block',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'clip',
          maxWidth: '100%',
        }}
      >
        {name}
      </span>
    </div>
  );
}
