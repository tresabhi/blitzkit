import { theme } from '../stitches.config';

export interface TitleBarProps {
  name: string;
  image?: string;
  description?: string;
}

export default function TitleBar({ name, image, description }: TitleBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', gap: 8 }}>
        {image && (
          <img
            style={{ width: 64, height: 64, objectFit: 'contain' }}
            src={image}
          />
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: 32,
                color: theme.colors.textHighContrast,
                fontWeight: 900,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              {name}
            </span>
          </div>

          <span style={{ color: theme.colors.textLowContrast, fontSize: 16 }}>
            {description}
          </span>
        </div>
      </div>
    </div>
  );
}
