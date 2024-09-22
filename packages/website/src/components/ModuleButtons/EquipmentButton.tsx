import { asset, equipmentDefinitions } from '@blitzkit/core';
import { GenericTankComponentButton } from './GenericTankComponentButton';
import { TankComponentButtonProps } from './TankComponentButton';

interface EquipmentButtonProps extends TankComponentButtonProps {
  equipment: number;
}

const awaitedEquipmentDefinitions = await equipmentDefinitions;

export function EquipmentButton({ equipment, ...props }: EquipmentButtonProps) {
  return (
    <GenericTankComponentButton
      tooltip={awaitedEquipmentDefinitions.equipments[equipment].name}
      icon={asset(`icons/equipment/${equipment}.webp`)}
      {...props}
    />
  );
}
