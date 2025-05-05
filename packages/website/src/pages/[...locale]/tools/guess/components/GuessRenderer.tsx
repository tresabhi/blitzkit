import { Canvas, invalidate } from '@react-three/fiber';
import { type QuicklimeCallback, Quicklime } from 'quicklime';
import { useCallback, useEffect, useRef } from 'react';
import { Fog } from 'three';
import { Controls } from '../../../../../components/Tankopedia/HeroSection/components/TankSandbox/components/Control';
import { Lighting } from '../../../../../components/Tankopedia/HeroSection/components/TankSandbox/components/Lighting';
import { TankModel } from '../../../../../components/Tankopedia/HeroSection/components/TankSandbox/components/TankModel';
import { Var } from '../../../../../core/radix/var';
import { TankopediaDisplay } from '../../../../../stores/tankopediaPersistent/constants';

const nearConcealed = -45;
const farConcealed = 22;
const nearRevealed = 25;
const farRevealed = 25;
const animationDuration = 1;

export const revealEvent = new Quicklime<boolean>();

export function GuessRenderer() {
  const fog = useRef(new Fog('black', nearConcealed, farConcealed));
  const reveal = useCallback((show: boolean) => {
    const t0 = Date.now() / 1000;

    function frame() {
      const t = Date.now() / 1000;
      const x = (t - t0) / animationDuration;
      const y = Math.sqrt(x);
      const near = nearConcealed * (1 - y) + nearRevealed * y;
      const far = farConcealed * (1 - y) + farRevealed * y;

      fog.current.near = near;
      fog.current.far = far;

      invalidate();

      if (y < 1) {
        requestAnimationFrame(frame);
      } else {
        fog.current.near = nearRevealed;
        fog.current.far = farRevealed;
      }
    }

    requestAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handleRevealEvent: QuicklimeCallback<boolean> = ({ data }) => {
      reveal(data);
    };

    revealEvent.on(handleRevealEvent);

    return () => {
      revealEvent.off(handleRevealEvent);
    };
  }, []);

  return (
    <Canvas
      style={{
        filter: `drop-shadow(0 0 1rem ${Var('black-a11')})`,
      }}
      camera={{ position: [-5, 5, -5] }}
      scene={{ fog: fog.current }}
    >
      <Controls distanceScale={2} zoomable={false} />
      <Lighting display={TankopediaDisplay.Model} />
      <TankModel />
    </Canvas>
  );
}
