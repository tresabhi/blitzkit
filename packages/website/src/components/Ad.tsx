import { Box, type BoxProps } from '@radix-ui/themes';
import { useEffect } from 'react';

type AdProps = BoxProps & {
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
        enabled: false,
        icon: true,
        wording: 'Report Ad',
        position: 'top-right',
      },
    });
  }, []);

  return <Box id={id} width="100%" {...props} />;
}
