import { Skeleton, type SkeletonProps } from '@radix-ui/themes';

export function InlineSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton style={{ display: 'inline-block' }} height="1em" {...props} />
  );
}
