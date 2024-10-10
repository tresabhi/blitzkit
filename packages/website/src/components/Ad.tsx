import { Box, type BoxProps } from '@radix-ui/themes';
import { uniqueId } from 'lodash-es';
import { useEffect, useRef } from 'react';

type AdProps = BoxProps & {};

export function Ad({ ...props }: AdProps) {
  const id = useRef(uniqueId('ad-'));

  useEffect(() => {
    (window as any).nitroAds.createAd(id.current, {
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

  return <Box id={id.current} width="100%" {...props} />;
}
