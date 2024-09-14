import { ComponentProps } from 'react';
import { skeleton } from './index.css';

export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return <div {...props} className={`${className} ${skeleton}`} />;
}
