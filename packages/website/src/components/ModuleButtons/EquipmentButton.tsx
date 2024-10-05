import { asset, fetchEquipmentDefinitions } from '@blitzkit/core';
import { GenericTankComponentButton } from './GenericTankComponentButton';
import type { TankComponentButtonProps } from './TankComponentButton';

interface EquipmentButtonProps extends TankComponentButtonProps {
  equipment: number;
}

const equipmentDefinitions = await fetchEquipmentDefinitions();

export function EquipmentButton({ equipment, ...props }: EquipmentButtonProps) {
  return (
    <GenericTankComponentButton
      tooltip={equipmentDefinitions.equipments[equipment].name}
      icon={asset(`icons/equipment/${equipment}.webp`)}
      {...props}
    />
  );
}
