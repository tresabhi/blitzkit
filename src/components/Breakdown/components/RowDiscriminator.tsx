export interface RowDiscriminatorProps {
  name: string;
  icon?: string;
}

export function RowDiscriminator({ name, icon }: RowDiscriminatorProps) {
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
      {icon && (
        <img
          src={icon}
          style={{ width: '100%', flex: 1, objectFit: 'cover' }}
        />
      )}
      <span
        style={{
          color: '#A0A0A0',
          fontSize: 16,
          textAlign: 'center',
          display: 'block',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
        }}
      >
        {name}
      </span>
    </div>
  );
}
