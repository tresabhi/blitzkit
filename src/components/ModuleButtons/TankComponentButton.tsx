import { Button, Text, Tooltip } from '@radix-ui/themes';
import { ComponentProps, ReactNode } from 'react';

export interface TankComponentButtonProps
  extends ComponentProps<typeof Button> {
  selected?: boolean;
  children?: ReactNode;
  discriminator?: ReactNode;
  disabled?: boolean;
  banner?: string;
  special?: boolean;
  tooltip?: string;
}

export function TankComponentButton({
  variant,
  selected,
  discriminator,
  special,
  children,
  banner,
  disabled,
  style,
  tooltip,
  ...props
}: TankComponentButtonProps) {
  const button = (
    <Button
      radius="medium"
      color={selected ? (special ? 'amber' : undefined) : 'gray'}
      variant={variant ?? (selected ? 'surface' : 'soft')}
      style={{
        padding: 0,
        minWidth: 48,
        height: 40,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'unset',
        pointerEvents: variant === 'ghost' ? 'none' : undefined,
        ...style,
      }}
      disabled={variant === 'ghost' || disabled}
      {...props}
    >
      {banner !== undefined && (
        <div
          style={{
            position: 'absolute',
            width: '200%',
            height: 12,
            backgroundColor: banner,
            top: '50%',
            left: '-50%',
            transform: 'translateY(-50%) rotate(-22.5deg)',
          }}
        />
      )}

      {children}

      {discriminator !== undefined && (
        <Text
          size="1"
          style={{
            textShadow: '0 0 4px black',
            position: 'absolute',
            top: '50%',
            right: 8,
            textAlign: 'right',
          }}
          color={variant === 'ghost' ? 'gray' : undefined}
        >
          {discriminator}
        </Text>
      )}
    </Button>
  );

  if (tooltip) return <Tooltip content={tooltip}>{button}</Tooltip>;
  return button;
}
