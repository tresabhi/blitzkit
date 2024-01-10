// // Vertex shader
// varying vec3 vNormal; // declare a varying variable to pass the normal vector
// void main() {
//   vNormal = normal; // assign the normal vector to the varying variable
//   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); // transform the vertex position
// }

// // Fragment shader
// varying vec3 vNormal; // declare the same varying variable to receive the normal vector
// void main() {
//   vec3 cameraDir = -viewPosition; // get the camera direction vector by negating the view position
//   float angle = acos(dot(vNormal, cameraDir)); // calculate the angle of the fragment using the dot product and the acos function
//   vec3 color = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0), angle / PI); // create a gradient color from red to blue based on the angle
//   gl_FragColor = vec4(color, 1.0); // set the fragment color
// }

import { MeshProps } from '@react-three/fiber';
import { MeshBasicMaterial } from 'three';
import CustomShaderMaterial from 'three-custom-shader-material';

interface ArmorMeshProps extends MeshProps {
  thickness: number;
  penetration: number;
  ricochet: number;
  caliber: number;
  normalization: number;
}

export function ArmorMesh({
  thickness,
  penetration,
  caliber,
  ricochet,
  normalization,
  ...props
}: ArmorMeshProps) {
  return (
    <>
      <mesh {...props}>
        <meshBasicMaterial colorWrite={false} />
      </mesh>

      <mesh {...props} renderOrder={1}>
        <CustomShaderMaterial
          baseMaterial={MeshBasicMaterial}
          transparent
          silent
          depthWrite={false}
          uniforms={{
            thickness: { value: thickness },
            penetration: { value: penetration },
            ricochet: { value: ricochet },
            caliber: { value: caliber },
            normalization: { value: normalization },
          }}
          vertexShader={`
            varying vec3 vNormal;
            varying vec3 vViewPosition;

            void main() {
              vec4 vViewPosition4 = modelViewMatrix * vec4(position, 1.0);
              vViewPosition = vViewPosition4.xyz;
              vNormal = normalMatrix * normal;
            }
          `}
          fragmentShader={`
            varying vec3 vViewPosition;
            uniform float thickness;
            uniform float penetration;
            uniform float ricochet;
            uniform float caliber;
            uniform float normalization;

            void main() {
              vec3 normalizedNormal = normalize(vNormal);
              vec3 normalizedViewPosition = normalize(vViewPosition);
              float angle = acos(dot(normalizedNormal, -normalizedViewPosition));
              float sinAngle = sin(angle);

              float penetrationChance = 0.0;
              float effectiveArmor = thickness * sinAngle;
              bool twoCaliberRule = caliber > 2.0 * thickness;
              bool threeCaliberRule = caliber > 3.0 * thickness;
              float finalNormalization = normalization;

              if (twoCaliberRule) {
                finalNormalization = (normalization * 1.4 * caliber) / (2.0 * thickness);
              }

              if (
                angle >= ricochet
                && !threeCaliberRule
              ) {
                penetrationChance = 1.0;
              }

              csm_FragColor *= vec4(1.0, 0.0, 0.0, penetrationChance * 0.5);
            }
          `}
        />

        {/* <meshBasicMaterial
          transparent
          opacity={0.5}
          color="red"
          depthWrite={false}
        /> */}
        {/* <shaderMaterial
          transparent
          depthWrite={false}
          args={[
            {
              vertexShader: `
                void main() {
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
              `,

              fragmentShader: `
                void main() {
                  gl_FragColor = vec4(1.0, 0.0, 0.0, 0.5);
                }
              `,
            },
          ]}
        /> */}
      </mesh>
    </>
  );
}
