import { GroupProps } from '@react-three/fiber';
import { forwardRef } from 'react';
import { Group } from 'three';

export const ModelTankWrapper = forwardRef<Group, GroupProps>((props, ref) => {
  return <group rotation={[-Math.PI / 2, 0, 0]} ref={ref} {...props} />;
});
