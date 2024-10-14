import { Box, type BoxProps } from '@radix-ui/themes';
import { useEffect } from 'react';

export type AdProps = BoxProps & {
  id: string;
};

export function Ad({ id, ...props }: AdProps) {
  useEffect(() => {
    (window as any).nitroAds.createAd(id, {
      refreshTime: 30,
      demo: import.meta.env.MODE === 'development',
      renderVisibleOnly: true,
      delayLoading: true,
      report: {
        enabled: true,
        icon: true,
        wording: 'Report Ad',
        position: 'top-right-side',
      },
    });
  }, [id]);

  return <Box id={id} className="ad-container" {...props} />;
}
