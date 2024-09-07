import { asset } from '@blitzkit/core';
import { equipmentDefinitions } from '@blitzkit/core/src/blitzkit/equipmentDefinitions';
import { use } from 'react';
import { GenericTankComponentButton } from './GenericTankComponentButton';
import { TankComponentButtonProps } from './TankComponentButton';

interface EquipmentButtonProps extends TankComponentButtonProps {
  equipment: number;
}

export function EquipmentButton({ equipment, ...props }: EquipmentButtonProps) {
  const awaitedEquipmentDefinitions = use(equipmentDefinitions);

  return (
    <GenericTankComponentButton
      tooltip={awaitedEquipmentDefinitions.equipments[equipment].name}
      icon={asset(`icons/equipment/${equipment}.webp`)}
      {...props}
    />
  );
}
