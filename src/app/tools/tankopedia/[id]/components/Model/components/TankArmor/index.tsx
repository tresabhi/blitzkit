import { createPortal, useFrame } from '@react-three/fiber';
import { memo } from 'react';
import { DepthTexture, Scene, Vector2 } from 'three';
import { externalModuleMaskRenderTarget } from '../../../../../../../../components/ArmorMesh';
import { spacedArmorDepthRenderTarget } from '../../../../../../../../components/ArmorMesh/components/SpacedArmorDepth';
import { ArmorHighlighting } from './components/ArmorHighlighting';
import { ExternalModuleMask } from './components/ExternalModuleMask';
import { SpacedArmorDepth } from './components/SpacedArmorDepth';

export const TankArmor = memo(() => {
  const externalModuleMaskScene = new Scene();
  const spacedArmorDepthScene = new Scene();
  const armorHighlightingScene = new Scene();
  const externalModuleMaskPortal = createPortal(
    <ExternalModuleMask />,
    externalModuleMaskScene,
  );
  const spacedArmorDepthPortal = createPortal(
    <SpacedArmorDepth />,
    spacedArmorDepthScene,
  );
  const armorHighlightingPortal = createPortal(
    <ArmorHighlighting />,
    armorHighlightingScene,
  );
  const renderSize = new Vector2();
  const newRenderSize = new Vector2();

  useFrame(({ gl, scene, camera }) => {
    const pixelRatio = gl.getPixelRatio();
    gl.autoClear = true;

    gl.getSize(newRenderSize).multiplyScalar(pixelRatio);
    if (!newRenderSize.equals(renderSize)) {
      renderSize.copy(newRenderSize);
      spacedArmorDepthRenderTarget.depthTexture = new DepthTexture(
        renderSize.x,
        renderSize.y,
      );
    }

    externalModuleMaskRenderTarget.setSize(renderSize.x, renderSize.y);
    gl.setRenderTarget(externalModuleMaskRenderTarget);
    gl.render(externalModuleMaskScene, camera);

    gl.clearDepth();
    spacedArmorDepthRenderTarget.setSize(renderSize.x, renderSize.y * 0.5);
    gl.setRenderTarget(spacedArmorDepthRenderTarget);
    gl.render(spacedArmorDepthScene, camera);

    gl.autoClear = false;

    gl.setRenderTarget(null);
    gl.render(scene, camera);

    gl.clearDepth();
    gl.render(armorHighlightingScene, camera);
  }, 1);

  return (
    <>
      {externalModuleMaskPortal}
      {spacedArmorDepthPortal}
      {armorHighlightingPortal}
    </>
  );
});
