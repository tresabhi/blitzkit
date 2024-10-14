import { Box, type BoxProps } from '@radix-ui/themes';
import { useEffect } from 'react';
import type { Vector2Tuple } from 'three';

export type AdProps = BoxProps & {
  id: string;
  commonHeight: 250;
};

export enum MaxAdSize {
  Size728x90,
  Size970x90,
  Size970x250,
  Size300x250,
  Size336x280,
  Size320x50,
  Size320x100,
  Size320x480,
  Size160x600,
  Size300x600,
}

const MAX_AD_SIZES: Record<MaxAdSize, Vector2Tuple> = {
  [MaxAdSize.Size728x90]: [728, 90],
  [MaxAdSize.Size970x90]: [970, 90],
  [MaxAdSize.Size970x250]: [970, 250],
  [MaxAdSize.Size300x250]: [300, 250],
  [MaxAdSize.Size336x280]: [336, 280],
  [MaxAdSize.Size320x50]: [320, 50],
  [MaxAdSize.Size320x100]: [320, 100],
  [MaxAdSize.Size320x480]: [320, 480],
  [MaxAdSize.Size160x600]: [160, 600],
  [MaxAdSize.Size300x600]: [300, 600],
};

export function Ad({ id, commonHeight, ...props }: AdProps) {
  // const [width, height] =
  //   maxAdSize === undefined
  //     ? [undefined, undefined]
  //     : MAX_AD_SIZES[maxAdSize].map((dimension) => `${dimension}px`);

  useEffect(() => {
    (window as any).nitroAds.createAd(id, {
      refreshTime: 30,
      demo: import.meta.env.MODE === 'development',
      renderVisibleOnly: true,
      delayLoading: true,
      report: {
        enabled: false,
        icon: true,
        wording: 'Report Ad',
        position: 'top-right',
      },
    });
  }, [id]);

  return (
    <Box
      id={id}
      width="100%"
      className="ad-container"
      height={commonHeight ? `${commonHeight}px` : 'auto'}
      {...props}
    />
  );
}
