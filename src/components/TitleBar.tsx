import isDev from '../core/process/isDev.js';
import { theme } from '../stitches.config.js';

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
        gap: 8,
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
          style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}
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
                overflow: 'hidden',
                textOverflow: 'ellipsis',
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
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
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

      <img
        style={{ width: 64, height: 64 }}
        src={
          isDev()
            ? 'https://i.imgur.com/j6TItdy.png'
            : 'https://i.imgur.com/pP6RN0x.png'
        }
      />
    </div>
  );
}
