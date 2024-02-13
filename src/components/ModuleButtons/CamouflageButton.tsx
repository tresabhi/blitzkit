import { asset } from '../../core/blitzkrieg/asset';
import { GenericTankComponentButton } from './GenericTankComponentButton';
import { TankComponentButtonProps } from './TankComponentButton';

export function CamouflageButton(props: TankComponentButtonProps) {
  return (
    <GenericTankComponentButton
      icon={asset('icons/camo.webp')}
      iconStyles={{
        top: '50%',
        left: '50%',
        transform: 'translate(calc(-50% + 4px), calc(-50% + 4px))',
      }}
      {...props}
    />
  );
}
