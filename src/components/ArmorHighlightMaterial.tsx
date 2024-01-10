import { GreaterEqualDepth } from 'three';

const INFLATE = '0.0';

export function ArmorHighlightMaterial() {
  return (
    <shaderMaterial
      depthFunc={GreaterEqualDepth}
      args={[
        {
          transparent: true,

          vertexShader: `
          varying vec3 vNormal;
          varying vec3 vViewPosition; // Camera position in view space
          
          void main() {
              vNormal = normalMatrix * normal; // Transform normal to view space
              vViewPosition = (modelViewMatrix * vec4(position, 1.0)).xyz; // Camera position in view space
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
          `,

          fragmentShader: `
          // Fragment Shader
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          
          void main() {
              // Use vNormal for your fragment shader calculations
              vec3 normal = normalize(vNormal);
              float uhhh = dot(normal, vViewPosition) * 0.5 + 1.0;
          
              // ... rest of your fragment shader code ...
              gl_FragColor = vec4(1.0, 0.0, 0.0, uhhh);
          }
          `,
        },
      ]}
    />
  );
}
