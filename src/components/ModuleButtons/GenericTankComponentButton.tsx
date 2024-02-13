import { HTMLAttributes } from 'react';
import {
  TankComponentButton,
  TankComponentButtonProps,
} from './TankComponentButton';

interface GenericTankComponentButtonProps extends TankComponentButtonProps {
  icon: string;
  iconStyles?: HTMLAttributes<HTMLImageElement>['style'];
}

export function GenericTankComponentButton({
  icon,
  iconStyles,
  ...props
}: GenericTankComponentButtonProps) {
  return (
    <TankComponentButton disabled={props.disabled} {...props}>
      <img
        draggable={false}
        src={icon}
        style={{
          width: 32,
          height: 32,
          position: 'absolute',
          opacity: props.disabled ? 0.5 : 1,
          transform: 'scale(0.75)',
          ...iconStyles,
        }}
      />
    </TankComponentButton>
  );
}
