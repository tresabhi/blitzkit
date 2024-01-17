import { Button, Text } from '@radix-ui/themes';
import { ComponentProps } from 'react';
import { asset } from '../core/blitzkrieg/asset';
import { TIER_ROMAN_NUMERALS, Tier } from '../core/blitzkrieg/tankDefinitions';

type ModuleButtonProps = Omit<ComponentProps<typeof Button>, 'type'> & {
  selected?: boolean;
  first?: boolean;
  last?: boolean;
  rowChild?: boolean;
} & (
    | {
        type: 'module';
        module: string;
        tier: Tier;
      }
    | {
        type: 'shell';
        shell: string;
      }
    | {
        type: 'equipment';
        equipment: number;
      }
  );

export function ModuleButton({
  selected,
  style,
  first = false,
  last = false,
  rowChild,
  ...props
}: ModuleButtonProps) {
  return (
    <Button
      radius="medium"
      color={selected ? undefined : 'gray'}
      variant={selected ? 'surface' : 'soft'}
      // variant="soft"
      style={{
        padding: 0,
        width: 48,
        height: 40,
        position: 'relative',
        borderTopLeftRadius: first ? undefined : 0,
        borderTopRightRadius: last ? undefined : 0,
        borderBottomLeftRadius: first ? undefined : 0,
        borderBottomRightRadius: last ? undefined : 0,
        margin: rowChild ? -0.5 : 'unset',
        ...style,
      }}
      {...(props as unknown as ComponentProps<typeof Button>)}
    >
      <img
        src={asset(
          props.type === 'module'
            ? `icons/modules/${props.module}.webp`
            : props.type === 'shell'
              ? `icons/shells/${props.shell}.webp`
              : `icons/equipment/${props.equipment}.webp`,
        )}
        style={{
          width: 32,
          height: 32,
          position: 'absolute',
          ...(props.type === 'module'
            ? {
                top: '50%',
                left: '50%',
                transform: 'translate(calc(-50% + 2px), calc(-50% + 2px))',
              }
            : {
                transform: 'scale(0.75)',
              }),
        }}
      />
      {props.type === 'module' && (
        <Text
          size="1"
          weight="bold"
          style={{
            zIndex: 1,
            position: 'absolute',
            top: '50%',
            right: 8,
            textAlign: 'right',
          }}
        >
          {TIER_ROMAN_NUMERALS[props.tier]}
        </Text>
      )}
    </Button>
  );
}
