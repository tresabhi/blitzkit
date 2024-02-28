import { createPortal, useFrame } from '@react-three/fiber';
import { memo } from 'react';
import { DepthTexture, Scene, Vector2 } from 'three';
import { CoreArmorScene } from './components/CoreArmorScene';
import { spacedArmorRenderTarget } from './components/CoreArmorSceneComponent';
import { SpacedArmorScene } from './components/SpacedArmorScene';

export const Armor = memo(() => {
  const spacedArmorScene = new Scene();
  const coreArmorScene = new Scene();
  const spacedArmorPortal = createPortal(
    <SpacedArmorScene />,
    spacedArmorScene,
  );
  const coreArmorPortal = createPortal(<CoreArmorScene />, coreArmorScene);

  const renderSize = new Vector2();
  const newRenderSize = new Vector2();

  useFrame(({ gl, camera, scene }) => {
    gl.autoClear = true;

    gl.getSize(newRenderSize).multiplyScalar(gl.getPixelRatio());

    if (!newRenderSize.equals(renderSize)) {
      renderSize.copy(newRenderSize);
      spacedArmorRenderTarget.depthTexture = new DepthTexture(
        renderSize.x,
        renderSize.y,
      );
    }

    spacedArmorRenderTarget.setSize(renderSize.x, renderSize.y);
    gl.setRenderTarget(spacedArmorRenderTarget);
    gl.render(spacedArmorScene, camera);

    gl.autoClear = false;

    gl.setRenderTarget(null);
    gl.render(scene, camera);

    gl.clearDepth();
    gl.render(coreArmorScene, camera);
  }, 1);

  return (
    <>
      {spacedArmorPortal}
      {coreArmorPortal}
    </>
  );
});
