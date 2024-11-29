import { asset } from '@blitzkit/core';
import { awaitableProvisionDefinitions } from '../../core/awaitables/provisionDefinitions';
import { GenericTankComponentButton } from './GenericTankComponentButton';
import type { TankComponentButtonProps } from './TankComponentButton';

interface ProvisionButtonProps extends TankComponentButtonProps {
  provision: number;
}

const provisionDefinitions = await awaitableProvisionDefinitions;

export function ProvisionButton({ provision, ...props }: ProvisionButtonProps) {
  return (
    <GenericTankComponentButton
      tooltip={provisionDefinitions.provisions[provision].name}
      icon={asset(`icons/provisions/${provision}.webp`)}
      {...props}
    />
  );
}
