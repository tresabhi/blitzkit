import { createPortal, useFrame, useThree } from '@react-three/fiber';
import { isInteger } from 'lodash';
import { ReactNode } from 'react';
import { Scene } from 'three';

interface HeadsUpDisplayProps {
  priority?: number;
  children: ReactNode;
}
/**
 * Renders `children` above the default scene, even if the priority is a
 * negative number.
 */
export function HeadsUpDisplay({
  priority = 1,
  children,
}: HeadsUpDisplayProps) {
  const { gl: renderer, scene: defaultScene, camera } = useThree();
  const scene = new Scene();
  const portal = createPortal(children, scene, {
    events: { priority: priority + 1 },
  });

  useFrame(() => {
    if (priority === 1) {
      renderer.clear();
      renderer.render(defaultScene, camera);
    }

    renderer.clearDepth();
    renderer.render(scene, camera);
  }, priority);

  renderer.autoClear = false;
  if (!isInteger(priority)) {
    throw new TypeError('Priority property must be an integer');
  }

  return portal;
}

/**
 * Use this component if the default scene disappears on usage of the
 * HeadsUpDisplay; caused because there are not HeadsUpDisplay components
 * with `1` priority.
 */
export function RenderDefault() {
  const { gl: renderer, scene, camera } = useThree();

  useFrame(() => renderer.render(scene, camera));

  return null;
}
