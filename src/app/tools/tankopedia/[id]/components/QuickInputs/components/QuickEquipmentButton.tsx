import { Button } from '@radix-ui/themes';
import { ComponentProps } from 'react';
import { asset } from '../../../../../../../core/blitzrinth/asset';

interface QuickEquipmentButtonProps extends ComponentProps<typeof Button> {
  equipment: number;
  active: boolean;
}

export function QuickEquipmentButton({
  equipment,
  active,
  ...props
}: QuickEquipmentButtonProps) {
  return (
    <Button variant="ghost" {...props}>
      <img
        style={{ opacity: active ? 1 : 0.5 }}
        src={asset(`icons/equipment/${equipment}.webp`)}
        width={24}
        height={24}
      />
    </Button>
  );
}
