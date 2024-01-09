import { Accessor, Document, Node, Scene } from '@gltf-transform/core';
import { times } from 'lodash';
import { Matrix4, Quaternion, Vector3, Vector4Tuple } from 'three';
import { Hierarchy, Sc2Stream } from '../streams/sc2';
import { ScgStream } from '../streams/scg';
import { VertexAttribute } from '../streams/scpg';
import {
  vertexAttributeGLTFName,
  vertexAttributeGltfVectorSizes,
} from './extractModel';
import { readDVPLFile } from './readDVPLFile';

Buffer.prototype.toJSON = function () {
  return [...(this as Buffer)].map((int) => int.toString(16)).join('');
};

export async function extractArmor(data: string, fileName: string) {
  const sc2Path = `${data}/3d/Tanks/CollisionMeshes/${fileName}.sc2.dvpl`;
  const scgPath = `${data}/3d/Tanks/CollisionMeshes/${fileName}.scg.dvpl`;
  const sc2 = new Sc2Stream(await readDVPLFile(sc2Path)).sc2();
  const scg = new ScgStream(await readDVPLFile(scgPath)).scg();
  const document = new Document();
  const scene = document.createScene();
  const buffer = document.createBuffer();

  function parseHierarchies(hierarchies: Hierarchy[], parent: Scene | Node) {
    hierarchies.forEach((hierarchy) => {
      const node = document.createNode(hierarchy.name);
      const components = times(
        hierarchy.components.count,
        (index) => hierarchy.components[index.toString().padStart(4, '0')],
      );

      components.forEach((component) => {
        switch (component['comp.typename']) {
          case 'TransformComponent': {
            const translation = new Vector3();
            const rotation = new Quaternion();
            const scale = new Vector3();

            new Matrix4()
              .multiplyMatrices(
                new Matrix4().compose(
                  new Vector3().fromArray(component['tc.worldTranslation']),
                  new Quaternion().fromArray(component['tc.worldRotation']),
                  new Vector3().fromArray(component['tc.worldScale']),
                ),
                new Matrix4().compose(
                  new Vector3().fromArray(component['tc.localTranslation']),
                  new Quaternion().fromArray(component['tc.localRotation']),
                  new Vector3().fromArray(component['tc.localScale']),
                ),
              )
              .decompose(translation, rotation, scale);

            node.setTranslation(translation.toArray());
            node.setRotation(rotation.toArray() as Vector4Tuple);
            node.setScale(scale.toArray());

            break;
          }

          case 'RenderComponent': {
            const batch = component['rc.renderObj']['ro.batches']['0000'];
            const polygonGroup = scg.get(batch['rb.datasource']);

            if (!polygonGroup) {
              console.warn(
                `Missing polygon group ${batch['rb.datasource']} (${hierarchy.name}); skipping...`,
              );

              break;
            }

            const hardJointIndices = new Set<number>();
            const vertexHardJointIndices = new Map<number, number>();
            const attributes = new Map<VertexAttribute, number[][]>();

            polygonGroup.vertices.forEach((vertex, index) => {
              vertex.forEach(({ attribute, value }) => {
                if (!attributes.has(attribute)) {
                  attributes.set(attribute, []);
                }

                attributes.get(attribute)!.push(value);

                if (attribute === VertexAttribute.HARD_JOINTINDEX) {
                  hardJointIndices.add(value[0]);
                  vertexHardJointIndices.set(index, value[0]);
                }
              });
            });

            if (attributes.has(VertexAttribute.TANGENT)) {
              attributes.set(
                VertexAttribute.TANGENT,
                attributes
                  .get(VertexAttribute.TANGENT)!
                  .map((tangent) => [...tangent, 1]),
              );
            }

            const accessors = new Map<string, Accessor>();

            attributes.forEach((value, attribute) => {
              const name = vertexAttributeGLTFName[attribute];
              if (!name || accessors.has(name)) return;
              const vertexSize = vertexAttributeGltfVectorSizes[attribute];
              const accessor = document
                .createAccessor(name)
                .setType(vertexSize === 1 ? 'SCALAR' : `VEC${vertexSize}`)
                .setArray(new Float32Array(value.flat()))
                .setBuffer(buffer);

              accessors.set(name, accessor);
            });

            hardJointIndices.forEach((hardJointIndex) => {
              const hardJointNode = document.createNode(
                `armor_${hardJointIndex}`,
              );
              const mesh = document.createMesh(batch['##name']);
              const indicesAccessor = document
                .createAccessor()
                .setType('SCALAR')
                .setArray(
                  new Uint16Array(
                    polygonGroup.indices.filter((index) => {
                      if (!vertexHardJointIndices.has(index)) {
                        throw new Error(
                          `Missing vertex hard joint index for index ${index}`,
                        );
                      }

                      return (
                        vertexHardJointIndices.get(index)! === hardJointIndex
                      );
                    }),
                  ),
                )
                .setBuffer(buffer);
              const primitive = document
                .createPrimitive()
                .setIndices(indicesAccessor);

              accessors.forEach((accessor, name) => {
                primitive.setAttribute(name, accessor);
              });

              mesh.addPrimitive(primitive);
              hardJointNode.setMesh(mesh);
              node.addChild(hardJointNode);
            });

            break;
          }

          default:
            throw new TypeError(
              `Unhandled component type: ${component['comp.typename']}`,
            );
        }
      });

      if (hierarchy['#hierarchy']) {
        parseHierarchies(hierarchy['#hierarchy'], node);
      }

      parent.addChild(node);
    });
  }

  parseHierarchies(sc2['#hierarchy'], scene);

  return document;
}
