'use client';

import { Checkbox, Flex, Heading } from '@radix-ui/themes';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { use, useState } from 'react';
import {
  BufferAttribute,
  BufferGeometry,
  Mesh,
  MeshStandardMaterial,
  Vector3Tuple,
} from 'three';
import model from '../../../../../test.json';
import { Flag } from '../../../../components/Flag';
import PageWrapper from '../../../../components/PageWrapper';
import { tankDefinitions } from '../../../../core/blitzkrieg/definitions/tanks';

const SIZE = 0.05;

export default function Page({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const awaitedTankDefinitions = use(tankDefinitions);
  const definition = awaitedTankDefinitions[id];
  const [display, setDisplay] = useState<boolean[]>(model.map(() => true));

  return (
    <PageWrapper>
      <Flex gap="2" align="center">
        <Flag nation={definition.nation} />
        <Heading>{definition.name}</Heading>
      </Flex>

      <Canvas
        style={{
          width: '100%',
          height: '60vh',
        }}
      >
        <OrbitControls />

        <ambientLight />
        <directionalLight intensity={1} />

        <group rotation={[-Math.PI / 2, 0, 0]}>
          {(model as { vertices: Vector3Tuple[]; indices: number[] }[]).map(
            ({ vertices, indices }, index) => {
              const geometry = new BufferGeometry();
              const verticesArray = new Float32Array(vertices.flat());
              const positionAttribute = new BufferAttribute(verticesArray, 3);
              const indexAttribute = new BufferAttribute(
                new Uint16Array(indices),
                1,
              );
              const material = new MeshStandardMaterial({
                color: 'white',
                metalness: 0.75,
                // roughness: 0.2,
              });

              geometry
                .setAttribute('position', positionAttribute)
                .setIndex(indexAttribute)
                .computeVertexNormals();

              return display[index] ? (
                <mesh
                  key={index}
                  args={[geometry, material]}
                  onPointerOver={(event) => {
                    event.stopPropagation();
                    (
                      (event.object as Mesh).material as MeshStandardMaterial
                    ).color.set('red');
                  }}
                  onPointerOut={(event) => {
                    event.stopPropagation();
                    (
                      (event.object as Mesh).material as MeshStandardMaterial
                    ).color.set('white');
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    const newDisplay = [...display];
                    newDisplay[index] = !newDisplay[index];
                    setDisplay(newDisplay);
                  }}
                />
              ) : null;
            },
          )}
        </group>
      </Canvas>

      <Flex wrap="wrap">
        {model.map((group, index) => (
          <Checkbox
            checked={display[index]}
            onCheckedChange={(value) => {
              const newDisplay = [...display];
              newDisplay[index] = value as boolean;
              setDisplay(newDisplay);
            }}
          />
        ))}
      </Flex>
    </PageWrapper>
  );
}
