import { asset } from '../../core/blitzkit/asset';
import { GenericTankComponentButton } from './GenericTankComponentButton';
import { TankComponentButtonProps } from './TankComponentButton';

interface ProvisionButtonProps extends TankComponentButtonProps {
  provision: number;
}

export function ProvisionButton({ provision, ...props }: ProvisionButtonProps) {
  return (
    <GenericTankComponentButton
      icon={asset(`icons/provisions/${provision}.webp`)}
      {...props}
    />
  );
}
