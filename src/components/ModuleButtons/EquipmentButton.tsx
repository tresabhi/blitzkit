import { asset } from '../../core/blitzkrieg/asset';
import { GenericTankComponentButton } from './GenericTankComponentButton';
import { TankComponentButtonProps } from './TankComponentButton';

interface EquipmentButtonProps extends TankComponentButtonProps {
  equipment: number;
}

export function EquipmentButton({ equipment, ...props }: EquipmentButtonProps) {
  return (
    <GenericTankComponentButton
      icon={asset(`icons/equipment/${equipment}.webp`)}
      {...props}
    />
  );
}
