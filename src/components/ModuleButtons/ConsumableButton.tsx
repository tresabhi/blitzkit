import { asset } from '../../core/blitzkrieg/asset';
import { GenericTankComponentButton } from './GenericTankComponentButton';
import { TankComponentButtonProps } from './TankComponentButton';

interface ConsumableButtonProps extends TankComponentButtonProps {
  consumable: number;
}

export function ConsumableButton({
  consumable,
  ...props
}: ConsumableButtonProps) {
  return (
    <GenericTankComponentButton
      icon={asset(`icons/consumables/${consumable}.webp`)}
      {...props}
    />
  );
}
