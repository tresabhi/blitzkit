import { type FlexProps, Box, Flex, Skeleton, Text } from '@radix-ui/themes';
import { useRef } from 'react';
import { useIntersection } from '../../hooks/useIntersection';
import { useLocale } from '../../hooks/useLocale';
import type { MaybeSkeletonComponentProps } from '../../types/maybeSkeletonComponentProps';
import { InlineSkeleton } from '../InlineSkeleton';
import type { AvatarGroupProps } from './Group';
import { Stack } from './Stack';

const MAX_AVATARS_PREVIEW = 5;

export function Content({
  ...props
}: FlexProps & MaybeSkeletonComponentProps<AvatarGroupProps>) {
  const { strings } = useLocale();
  const container = useRef<HTMLDivElement>(null);

  useIntersection(() => props.skeleton && props.onIntersection?.(), container, {
    disabled: !props.skeleton || props.onIntersection === undefined,
  });

  return (
    <Flex
      ref={container}
      direction="column"
      gap="3"
      style={{ cursor: props.skeleton ? undefined : 'pointer' }}
      {...props}
    >
      <Box width="100%" style={{ aspectRatio: '7 / 8' }} position="relative">
        {props.skeleton && <Skeleton height="100%" />}

        {!props.skeleton && (
          <Stack avatars={[...props.avatars].slice(-MAX_AVATARS_PREVIEW)} />
        )}
      </Box>

      <Text
        size="2"
        wrap="nowrap"
        align="center"
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontStyle:
            !props.skeleton && props.name === undefined ? 'italic' : undefined,
        }}
      >
        {props.skeleton ? (
          <InlineSkeleton width="100%" />
        ) : (
          (props.name ?? strings.website.tools.avatars.unnamed_avatars)
        )}
      </Text>
    </Flex>
  );
}
