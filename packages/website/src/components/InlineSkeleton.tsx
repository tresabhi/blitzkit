import { Skeleton, type SkeletonProps } from '@radix-ui/themes';

export function InlineSkeleton({ style, ...props }: SkeletonProps) {
  return (
    <Skeleton
      height="1em"
      style={{ display: 'inline-block', ...style }}
      {...props}
    />
  );
}
