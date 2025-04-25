import type { ComponentProps } from 'react';
import { Var } from '../../core/radix/var';
import './index.css';

export function Mark({ style, ...props }: ComponentProps<'mark'>) {
  return (
    <mark
      className="mark"
      style={{
        borderRadius: Var('radius-1'),
        ...style,
      }}
      {...props}
    />
  );
}
