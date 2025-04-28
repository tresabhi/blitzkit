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
  const reloadCircle = useRef<HTMLDivElement>(null!);
  const reloadCore = useRef<HTMLDivElement>(null!);
  const reloadGlow = useRef<HTMLDivElement>(null!);

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
      const reloadAngle = data.reload * 2 * Math.PI;

      reloadCircle.current.style.background = `conic-gradient(${Var('amber-9')} 0 ${reloadAngle}rad, ${Var('red-7')} ${reloadAngle}rad)`;
      reloadCore.current.style.background = `conic-gradient(${Var('amber-3')} 0 ${reloadAngle}rad, ${Var('red-2')} ${reloadAngle}rad)`;
      reloadGlow.current.style.background = `conic-gradient(${Var('amber-8')} 0 ${reloadAngle}rad, transparent ${reloadAngle}rad)`;
    };

    reloadUpdate.on(handleReloadUpdate);

    return () => {
      reloadUpdate.off(handleReloadUpdate);
    };
  }, []);

  return (
    <Card variant="classic" mb="6" style={{ aspectRatio: '1 / 1' }}>
      <Box
        p="4"
        position="absolute"
        top="50%"
        left="50%"
        width={size}
        height={size}
        className="reload"
        ref={reloadGlow}
        style={{
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          filter: 'blur(0.5rem)',
        }}
      />

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
        }}
      >
        <Box
          ref={reloadCore}
          style={{
            backgroundColor: Var('red-2'),
            borderRadius: '50%',
          }}
          width="100%"
          height="100%"
          overflow="hidden"
        >
          <Box
            style={{
              width: '100%',
              height: '100%',
              background: `radial-gradient(${Var('gray-3')} 25%, transparent)`,
            }}
          />
        </Box>
      </Box>

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

      {times(stats.shells, (index) => (
        <Shell stats={stats} index={index} key={index} />
      ))}
    </Card>
  );
}
