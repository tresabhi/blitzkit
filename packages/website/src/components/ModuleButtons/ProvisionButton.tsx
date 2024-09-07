import { asset } from '@blitzkit/core';
import { provisionDefinitions } from '@blitzkit/core/src/blitzkit/provisionDefinitions';
import { use } from 'react';
import { GenericTankComponentButton } from './GenericTankComponentButton';
import { TankComponentButtonProps } from './TankComponentButton';

interface ProvisionButtonProps extends TankComponentButtonProps {
  provision: number;
}

export function ProvisionButton({ provision, ...props }: ProvisionButtonProps) {
  const awaitedProvisionDefinitions = use(provisionDefinitions);

  return (
    <GenericTankComponentButton
      tooltip={awaitedProvisionDefinitions[provision].name}
      icon={asset(`icons/provisions/${provision}.webp`)}
      {...props}
    />
  );
}
