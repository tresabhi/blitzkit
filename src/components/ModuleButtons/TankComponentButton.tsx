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
}

export function TankComponentButton({
  selected,
  first = false,
  last = false,
  rowChild,
  discriminator,
  children,
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
      }}
      {...props}
    >
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
