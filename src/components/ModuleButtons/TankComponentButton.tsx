import { Button, Text } from '@radix-ui/themes';
import { ComponentProps, ReactNode } from 'react';

export interface TankComponentButtonProps
  extends ComponentProps<typeof Button> {
  selected?: boolean;
  first?: boolean;
  last?: boolean;
  rowChild?: boolean;
  children?: ReactNode;
  discriminator?: ReactNode;
  disabled?: boolean;
  banner?: string;
}

export function TankComponentButton({
  selected,
  first = false,
  last = false,
  rowChild,
  discriminator,
  children,
  banner,
  ...props
}: TankComponentButtonProps) {
  return (
    <Button
      radius="medium"
      color={selected ? undefined : 'gray'}
      variant={selected ? 'surface' : 'soft'}
      style={{
        padding: 0,
        minWidth: 48,
        height: 40,
        position: 'relative',
        borderTopLeftRadius: first ? undefined : 0,
        borderTopRightRadius: last ? undefined : 0,
        borderBottomLeftRadius: first ? undefined : 0,
        borderBottomRightRadius: last ? undefined : 0,
        margin: rowChild ? -0.5 : 'unset',
        overflow: 'hidden',
      }}
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

      {discriminator !== undefined && (
        <Text
          size="1"
          style={{
            color: 'white',
            textShadow: '0 0 4px black',
            zIndex: 1,
            position: 'absolute',
            top: '50%',
            right: 8,
            textAlign: 'right',
          }}
        >
          {discriminator}
        </Text>
      )}

      {children}
    </Button>
  );
}
