import { AdditiveBlending, ShaderMaterial } from 'three';
import fragmentShader from './fragment.glsl';
import vertexShader from './vertex.glsl';

export function spacedMaterial(thickness: number, penetration: number) {
  return new ShaderMaterial({
    fragmentShader,
    vertexShader,

    depthTest: true,
    depthWrite: false,
    blending: AdditiveBlending,

    uniforms: {
      thickness: { value: thickness },
      penetration: { value: penetration },
    },
  });
}
