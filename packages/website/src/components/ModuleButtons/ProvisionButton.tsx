import { asset, provisionDefinitions } from '@blitzkit/core';
import { GenericTankComponentButton } from './GenericTankComponentButton';
import { TankComponentButtonProps } from './TankComponentButton';

interface ProvisionButtonProps extends TankComponentButtonProps {
  provision: number;
}

const awaitedProvisionDefinitions = await provisionDefinitions;

export function ProvisionButton({ provision, ...props }: ProvisionButtonProps) {
  return (
    <GenericTankComponentButton
      tooltip={awaitedProvisionDefinitions[provision].name}
      icon={asset(`icons/provisions/${provision}.webp`)}
      {...props}
    />
  );
}
