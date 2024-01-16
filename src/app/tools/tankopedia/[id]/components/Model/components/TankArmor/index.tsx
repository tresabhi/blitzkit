import { createPortal, useFrame } from '@react-three/fiber';
import { memo } from 'react';
import { Scene } from 'three';
import { externalModuleMaskRenderTarget } from '../../../../../../../../components/ArmorMesh';
import { Duel } from '../../../../page';
import { ArmorHighlighting } from './components/ArmorHighlighting';
import { ExternalModuleMask } from './components/ExternalModuleMask';

interface TankArmorProps {
  duel: Duel;
}

export const TankArmor = memo<TankArmorProps>(({ duel }) => {
  const externalModuleMaskScene = new Scene();
  const armorHighlightingScene = new Scene();
  const externalModuleMaskPortal = createPortal(
    <ExternalModuleMask duel={duel} />,
    externalModuleMaskScene,
  );
  const armorHighlightingPortal = createPortal(
    <ArmorHighlighting duel={duel} />,
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

    gl.autoClear = false;

    gl.setRenderTarget(null);
    gl.render(scene, camera);
    gl.clearDepth();
    gl.render(armorHighlightingScene, camera);
  }, 1);

  return (
    <>
      {externalModuleMaskPortal}
      {armorHighlightingPortal}
    </>
  );
});
