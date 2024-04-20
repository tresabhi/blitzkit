import { asset } from '../../core/blitzrinth/asset';
import { GenericTankComponentButton } from './GenericTankComponentButton';
import { TankComponentButtonProps } from './TankComponentButton';

interface ModuleProps extends TankComponentButtonProps {
  module: string;
}

export function ModuleButton({ module, ...props }: ModuleProps) {
  return (
    <GenericTankComponentButton
      icon={asset(`icons/modules/${module}.webp`)}
      iconStyles={{
        top: '50%',
        left: '50%',
        transform: 'translate(calc(-50% + 2px), calc(-50% + 2px))',
      }}
      {...props}
    />
  );
}
