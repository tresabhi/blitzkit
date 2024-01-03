import { MeshProps } from '@react-three/fiber';
import { forwardRef } from 'react';
import { DoubleSide, Mesh } from 'three';

interface InfiniteGridHelperProps extends MeshProps {
  size1?: number;
  size2?: number;
  color?: THREE.Color;
  distance?: number;
}
/**
 * Thanks, Fyrestar, for [THREE.InfiniteGridHelper](https://github.com/Fyrestar/THREE.InfiniteGridHelper/)!
 */
const InfiniteGridHelper = forwardRef<Mesh, InfiniteGridHelperProps>(
  ({ size1, size2, color, distance, ...props }, ref) => {
    return (
      <mesh {...props} ref={ref} frustumCulled={false}>
        <shaderMaterial
          args={[
            {
              side: DoubleSide,
              uniforms: {
                uSize1: { value: size1 },
                uSize2: { value: size2 },
                uColor: { value: color },
                uDistance: { value: distance },
              },
              extensions: { derivatives: true },
              transparent: true,

              vertexShader: `
                varying vec3 worldPosition;
                uniform float uDistance;

                void main() {
                  vec3 pos = position.xzy * uDistance;
                  worldPosition = pos;
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
              `,

              fragmentShader: `
                varying vec3 worldPosition;
                uniform float uSize1;
                uniform float uSize2;
                uniform vec3 uColor;
                uniform float uDistance;
                vec2 origin = vec2(0.0, 0.0);

                float getGrid(float size) {
                  vec2 r = worldPosition.xz / size;
                  vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
                  float line = min(grid.x, grid.y);

                  return (1.0 - min(line, 1.0)) * max(0.0, min(1.0, cameraPosition.y / 5.0));
                }

                void main() {
                  float d = 1.0 - min(distance(origin, worldPosition.xz) / uDistance, 1.0);
                  float g1 = getGrid(uSize1);
                  float g2 = getGrid(uSize2);
                  gl_FragColor = vec4(uColor.rgb, mix(g2, g1, g1) * pow(d, 10.0));
                  gl_FragColor.a = mix(0.5 * gl_FragColor.a, gl_FragColor.a, g2);

                  if ( gl_FragColor.a <= 0.0 ) discard;
                }
              `,
            },
          ]}
        />
        <planeGeometry />
      </mesh>
    );
  },
);
export default InfiniteGridHelper;
