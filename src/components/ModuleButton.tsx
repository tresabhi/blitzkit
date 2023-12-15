import { Button, Text } from '@radix-ui/themes';
import { ComponentProps } from 'react';
import { asset } from '../core/blitzkrieg/asset';
import { TIER_ROMAN_NUMERALS, Tier } from '../core/blitzkrieg/tankDefinitions';

interface ModuleButtonProps
  extends Omit<ComponentProps<typeof Button>, 'type'> {
  type: string;
  tier: Tier;
  selected?: boolean;
}

export function ModuleButtons({
  type,
  tier,
  selected,
  style,
  ...props
}: ModuleButtonProps) {
  return (
    <Button
      radius="medium"
      color={selected ? undefined : 'gray'}
      variant={selected ? 'solid' : 'soft'}
      style={{
        padding: 0,
        width: 48,
        height: 40,
        position: 'relative',
        ...style,
      }}
      {...props}
    >
      <img
        src={asset(`icons/modules/${type}.webp`)}
        style={{
          width: 32,
          height: 32,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(calc(-50% + 2px), calc(-50% + 2px))',
        }}
      />
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
        {TIER_ROMAN_NUMERALS[tier]}
      </Text>
    </Button>
  );
}
