import { theme } from '../stitches.config';

interface TitleBarProps {
  title: string;
  image?: string;
  description?: string;
}

export function TitleBar({ title, image, description }: TitleBarProps) {
  return (
    <div
      style={{
        gap: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '8px 0px',
      }}
    >
      <div
        style={{
          gap: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {image && (
          <img
            alt={title}
            style={{ width: 32, height: 32, objectFit: 'contain' }}
            src={image}
          />
        )}

        <span
          style={{
            fontSize: 32,
            fontWeight: 900,
            background: `linear-gradient(180deg, ${theme.colors.textHighContrast} 0%, ${theme.colors.textLowContrast} 100%)`,
            backgroundClip: 'text',
          }}
        >
          {title}
        </span>
      </div>

      <span style={{ color: theme.colors.textLowContrast, fontSize: 16 }}>
        {description}
      </span>
    </div>
  );
}
