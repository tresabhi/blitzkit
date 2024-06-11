'use client';

import { Box, Flex, Text } from '@radix-ui/themes';
import { uniqueId } from 'lodash';
import { ComponentProps, useEffect, useRef } from 'react';
import { Vector2Tuple } from 'three';
import { imgur } from '../core/blitzkit/imgur';
import { useApp } from '../stores/app';

export enum AdType {
  MediumRectangleHorizontalPurple = 738182777,
  LeaderboardHorizontalPurple = 84051521,
  WideSkyscraperVerticalPurple = 1755617140,
  HalfPageVerticalPurple = 880185176,
}

const AD_DIMENSIONS: Record<AdType, Vector2Tuple> = {
  [AdType.MediumRectangleHorizontalPurple]: [300, 250],
  [AdType.LeaderboardHorizontalPurple]: [728, 90],
  [AdType.WideSkyscraperVerticalPurple]: [160, 600],
  [AdType.HalfPageVerticalPurple]: [300, 600],
};

interface AdProps extends ComponentProps<'div'> {
  type: AdType;
}

export function Ad({ type, ...props }: AdProps) {
  const id = useRef(uniqueId());
  const dimensions = AD_DIMENSIONS[type];
  const developerMode = useApp((state) => state.developerMode);

  useEffect(() => {
    (window as any).msAdsQueue.push(function () {
      (window as any).mmnow.render({
        adUnitId: type,
        elementId: `${type}-${id.current}`,
      });
    });
  }, [type]);

  return (
    <Box
      position="relative"
      width={`${dimensions[0]}px`}
      height={`${dimensions[1]}px`}
      style={{
        outline: '1px solid var(--gray-3)',
        borderRadius: 'var(--radius-1)',
        background: `url(${imgur('DK21EHY')})`,
      }}
      {...props}
    >
      <Flex
        position="absolute"
        top="50%"
        left="50%"
        style={{ transform: 'translate(-50%, -50%)' }}
        direction="column"
        align="center"
      >
        {!developerMode && <Text color="gray">Advertisement</Text>}
        {developerMode && (
          <>
            <Text size="1" color="gray">
              {AdType[type]}
            </Text>
            <Text size="1" color="gray">
              {dimensions[0]}x{dimensions[1]}
            </Text>
          </>
        )}
      </Flex>

      <Box position="relative" id={`${type}-${id.current}`} />
    </Box>
  );
}
