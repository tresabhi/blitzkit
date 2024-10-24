import { Flex, Skeleton, Text } from '@radix-ui/themes';
import { useRef } from 'react';
import { useIntersection } from '../../hooks/useIntersection';
import type { MaybeSkeletonComponentProps } from '../../types/maybeSkeletonComponentProps';

type GalleryCardProps = MaybeSkeletonComponentProps<{
  id: string;
  name: string;
}>;

export function GalleryCard(props: GalleryCardProps) {
  const card = useRef<HTMLDivElement>(null);

  useIntersection(() => props.skeleton && props.onIntersection?.(), card, {
    disabled: !props.skeleton || props.onIntersection === undefined,
  });

  return (
    <Flex direction="column" align="center" width="6rem" gap="1" ref={card}>
      {props.skeleton && (
        <>
          <Skeleton width="100%" height="4.57rem" />
          <Skeleton width="100%" height="1em" />
        </>
      )}

      {!props.skeleton && (
        <>
          <img
            style={{
              width: '4rem',
              height: '4.57rem',
              // aspect ratio 7 / 8
              objectFit: 'cover',
            }}
            src={`/api/gallery/${props.id}.webp`}
          />

          <Text align="center" style={{ maxWidth: '100%' }}>
            {props.name}
          </Text>
        </>
      )}
    </Flex>
  );
}
