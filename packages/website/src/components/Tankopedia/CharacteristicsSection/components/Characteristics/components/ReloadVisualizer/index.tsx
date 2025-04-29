import { Box, Card } from '@radix-ui/themes';
import { times } from 'lodash-es';
import { Quicklime, type QuicklimeCallback } from 'quicklime';
import { useEffect, useRef } from 'react';
import { Var } from '../../../../../../../core/radix/var';
import type { StatsAcceptorProps } from '../HullTraverseVisualizer';
import { Shell } from './components/Shell';
import { Target } from './components/Target';

export interface ReloadUpdateData {
  reload: number;
  shells: number[];
}

export const reloadUpdate = new Quicklime<ReloadUpdateData>();

export function ReloadVisualizer({ stats }: StatsAcceptorProps) {
  const reloadCircle = useRef<HTMLDivElement>(null);
  const reloadCore = useRef<HTMLDivElement>(null);
  const reloadGlow = useRef<HTMLDivElement>(null);
  const t = useRef(0);

  useEffect(() => {
    let cancel = false;
    let lastT = Date.now() / 1000;
    const period =
      stats.shellReload! +
      (stats.intraClip ? stats.intraClip * (stats.shells - 1) : 0);

    function frame() {
      const now = Date.now() / 1000;
      const dt = now - lastT;
      t.current = (t.current + dt) % period;

      // clipReloadProgress.current =
      //   (clipReloadProgress.current + dt / stats.shellReload!) % 1;

      const reload =
        t.current < stats.shellReload!
          ? t.current / stats.shellReload!
          : ((t.current - stats.shellReload!) % stats.intraClip!) /
            stats.intraClip!;
      const shells =
        t.current < stats.shellReload!
          ? Array(stats.shells).fill(reload)
          : times(stats.shells, (index) =>
              index < (t.current - stats.shellReload!) / stats.intraClip!
                ? 0
                : 1,
            );

      reloadUpdate.dispatch({ reload, shells });

      if (!cancel) requestAnimationFrame(frame);

      lastT = now;
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
      if (!reloadCircle.current || !reloadCore.current || !reloadGlow.current)
        return;

      const reloadAngle = data.reload * 2 * Math.PI;

      reloadCircle.current.style.background = `conic-gradient(${Var('amber-9')} 0 ${reloadAngle}rad, ${Var('orange-7')} ${reloadAngle}rad)`;
      reloadCore.current.style.background = `conic-gradient(${Var('amber-6')} 0 ${reloadAngle}rad, ${Var('orange-3')} ${reloadAngle}rad)`;
      reloadGlow.current.style.background = `conic-gradient(${Var('amber-9')} 0 ${reloadAngle}rad, transparent ${reloadAngle}rad)`;
    };

    reloadUpdate.on(handleReloadUpdate);

    return () => {
      reloadUpdate.off(handleReloadUpdate);
    };
  }, []);

  return (
    <Card variant="classic" mb="6" style={{ aspectRatio: '1 / 1' }}>
      <Box position="absolute" top="0" left="0" width="100%" height="100%">
        <Target />

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
        width="12rem"
        height="12rem"
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
        width="12rem"
        height="12rem"
        className="reload"
        ref={reloadCircle}
        style={{
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: Var('orange-7'),
        }}
      >
        <Box
          width="100%"
          height="100%"
          style={{
            borderRadius: '50%',
            background: 'black',
            overflow: 'hidden',
          }}
          position="relative"
        >
          <Target />

          <Box
            ref={reloadCore}
            width="100%"
            height="100%"
            position="absolute"
            top="0"
            left="0"
            style={{
              borderRadius: '50%',
              maskImage: 'radial-gradient(transparent 25%, black 100%)',
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

      {stats.shells > 1 &&
        times(stats.shells, (index) => (
          <Shell stats={stats} index={index} key={index} />
        ))}
    </Card>
  );
}
