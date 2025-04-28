import { Box, Card } from '@radix-ui/themes';
import { times } from 'lodash-es';
import { Quicklime, type QuicklimeCallback } from 'quicklime';
import { useEffect, useRef } from 'react';
import { Var } from '../../../../../../../core/radix/var';
import type { StatsAcceptorProps } from '../HullTraverseVisualizer';
import { Shell } from './components/Shell';

export interface ReloadUpdateData {
  reload: number;
  shells: number[];
}

export const reloadUpdate = new Quicklime<ReloadUpdateData>();

export function ReloadVisualizer({ stats }: StatsAcceptorProps) {
  const reloadCircle = useRef<HTMLDivElement>(null);

  const size = `${stats.shells === 1 ? 66 : 58}%`;

  useEffect(() => {
    let cancel = false;

    function frame() {
      const now = Date.now() / 1000;

      const t = now % stats.shellReload!;
      const x = t / stats.shellReload!;

      reloadUpdate.dispatch({
        reload: x,
        shells: Array(stats.shells).fill(x),
      });

      if (!cancel) requestAnimationFrame(frame);
    }

    frame();

    return () => {
      cancel = true;
    };
  }, [stats]);

  useEffect(() => {
    const handleReloadUpdate: QuicklimeCallback<ReloadUpdateData> = ({
      data,
    }) => {
      if (!reloadCircle.current) return;

      const reloadAngle = data.reload * 2 * Math.PI;

      reloadCircle.current.style.background = `conic-gradient(${Var('amber-9')} 0 ${reloadAngle}rad, ${Var('red-7')} ${reloadAngle}rad)`;
    };

    reloadUpdate.on(handleReloadUpdate);

    return () => {
      reloadUpdate.off(handleReloadUpdate);
    };
  }, []);

  return (
    <Card variant="classic" mb="6" style={{ aspectRatio: '1 / 1' }}>
      <Box position="absolute" top="0" left="0" width="100%" height="100%">
        <img
          src="/assets/images/tankopedia/visualizers/reload/background.jpg"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(0.2rem) contrast(1.2) brightness(0.5) saturate(0.8)',
          }}
        />

        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          style={{
            background: `radial-gradient(transparent 50%, ${Var('black-a8')} 100%)`,
          }}
        />
      </Box>

      <Box
        p="1"
        position="absolute"
        top="50%"
        left="50%"
        width={size}
        height={size}
        className="reload"
        ref={reloadCircle}
        style={{
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: Var('red-7'),
          maskImage: `radial-gradient(transparent 65%, black 68%)`,
        }}
      />

      <img
        src="/assets/images/tankopedia/visualizers/reload/caret.png"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '10%',
          height: '10%',
        }}
      />

      {stats.shells > 1 &&
        times(stats.shells, (index) => (
          <Shell stats={stats} index={index} key={index} />
        ))}
    </Card>
  );
}
