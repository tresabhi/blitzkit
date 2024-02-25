import { asset } from '../../core/blitzkrieg/asset';
import { GenericTankComponentButton } from './GenericTankComponentButton';
import { TankComponentButtonProps } from './TankComponentButton';

interface ShellButtonProps extends TankComponentButtonProps {
  shell: string;
}

export function ShellButton({ shell, ...props }: ShellButtonProps) {
  return (
    <GenericTankComponentButton
      icon={asset(`icons/shells/${shell}.webp`)}
      {...props}
    />
  );
}
