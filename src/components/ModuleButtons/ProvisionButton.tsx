import { use } from 'react';
import { asset } from '../../core/blitzkit/asset';
import { provisionDefinitions } from '../../core/blitzkit/provisionDefinitions';
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
