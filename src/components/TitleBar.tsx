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
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', gap: 8 }}>
        {image && <img style={{ width: 64, height: 64 }} src={image} />}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span
            style={{
              fontSize: 32,
              color: 'white',
              fontWeight: 900,
              gap: 4,
            }}
          >
            {name}
            {nameDiscriminator && (
              <span style={{ color: '#A0A0A0' }}>{nameDiscriminator}</span>
            )}
          </span>

          <span style={{ color: '#A0A0A0', fontSize: 16 }}>{description}</span>
        </div>
      </div>

      <img
        style={{ width: 64, height: 64 }}
        src="https://i.imgur.com/35phKIu.png"
      />
    </div>
  );
}
