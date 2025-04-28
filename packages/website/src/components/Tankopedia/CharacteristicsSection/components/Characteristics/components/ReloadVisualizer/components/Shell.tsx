import { Box, Flex } from '@radix-ui/themes';
import type { QuicklimeCallback } from 'quicklime';
import { useEffect, useRef } from 'react';
import { reloadUpdate, type ReloadUpdateData } from '..';
import { Var } from '../../../../../../../../core/radix/var';
import type { StatsAcceptorProps } from '../../HullTraverseVisualizer';

interface ShellProps {
  index: number;
}

export function Shell({ index, stats }: ShellProps & StatsAcceptorProps) {
  const bar = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const handleReloadUpdate: QuicklimeCallback<ReloadUpdateData> = ({
      data,
    }) => {
      bar.current.style.width = `${data.shells[index] * 100}%`;
    };

    reloadUpdate.on(handleReloadUpdate);

    return () => {
      reloadUpdate.off(handleReloadUpdate);
    };
  }, []);

  return (
    <Box
      style={{
        width: '100%',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) rotate(${(index - Math.floor(stats.shells / 2)) * 10}deg)`,
      }}
    >
      <Flex
        justify="end"
        style={{
          position: 'absolute',
          left: '50%',
          marginLeft: 'calc(25% + 2rem)',
          width: '1.25rem',
          height: '0.5rem',
          borderRadius: '0.25rem',
          overflow: 'hidden',
          outline: `1px solid ${Var('jade-6')}`,
        }}
      >
        <Box
          ref={bar}
          style={{
            background: Var('jade-9'),
          }}
        />
      </Flex>
    </Box>
  );
}
