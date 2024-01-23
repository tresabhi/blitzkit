import { createPortal, useFrame } from '@react-three/fiber';
import { memo } from 'react';
import { DepthTexture, Scene } from 'three';
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

  useFrame(({ gl, scene, camera }) => {
    gl.autoClear = true;

    externalModuleMaskRenderTarget.setSize(
      gl.domElement.width,
      gl.domElement.height,
    );
    gl.setRenderTarget(externalModuleMaskRenderTarget);
    gl.render(externalModuleMaskScene, camera);

    gl.clearDepth();
    spacedArmorDepthRenderTarget.setSize(
      gl.domElement.width,
      gl.domElement.height,
    );
    if (!spacedArmorDepthRenderTarget.depthTexture) {
      spacedArmorDepthRenderTarget.depthTexture = new DepthTexture(
        gl.domElement.width,
        gl.domElement.height,
      );
    }
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
