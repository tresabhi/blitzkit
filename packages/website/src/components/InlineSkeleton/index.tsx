import { Skeleton, type SkeletonProps } from '@radix-ui/themes';
import './index.css';

export function InlineSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      className={`inline-skeleton ${className}`}
      height="1em"
      {...props}
    />
  );
}
