import { theme } from '../stitches.config';

export interface TitleBarProps {
  name: string;
  nameDiscriminator?: string;
  image?: string;
  description?: string;
}

export default function TitleBar({
  name,
  nameDiscriminator,
  image,
  description,
}: TitleBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', gap: 8, flex: 1 }}>
        {image && (
          <img
            style={{ width: 64, height: 64, objectFit: 'contain' }}
            src={image}
          />
        )}

        <div
          style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}
        >
          <div
            style={{
              display: 'flex',
              gap: 4,
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                fontSize: 32,
                color: theme.colors.textHighContrast,
                fontWeight: 900,
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </span>
            {nameDiscriminator && (
              <span
                style={{
                  flex: 1,
                  fontSize: 32,
                  color: theme.colors.textLowContrast,
                  fontWeight: 900,
                  whiteSpace: 'nowrap',
                }}
              >
                {nameDiscriminator}
              </span>
            )}
          </div>

          <span style={{ color: theme.colors.textLowContrast, fontSize: 16 }}>
            {description}
          </span>
        </div>
      </div>
    </div>
  );
}
