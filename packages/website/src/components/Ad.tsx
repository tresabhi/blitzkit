import { Box, type BoxProps } from '@radix-ui/themes';
import { useEffect } from 'react';

type AdProps = BoxProps & {};

export function Ad({ ...props }: AdProps) {
  const id = 'test';

  useEffect(() => {
    (window as any).nitroAds.createAd('test', {
      demo: true,
      refreshTime: 30,
      renderVisibleOnly: false,
      sizes: [],
      report: {
        enabled: true,
        icon: true,
        wording: 'Report Ad',
        position: 'top-right',
      },
    });
  }, [id]);

  return <Box id={id} {...props} />;
}
