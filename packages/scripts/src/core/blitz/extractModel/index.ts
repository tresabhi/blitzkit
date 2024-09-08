import {
  Hierarchy,
  Sc2ReadStream,
  ScgReadStream,
  Textures,
  VertexAttribute,
} from '@blitzkit/core';
import { Document, Material, Node, Scene } from '@gltf-transform/core';
import { times } from 'lodash';
import { dirname } from 'path';
import { Matrix4, Quaternion, Vector3, Vector4Tuple } from 'three';
import { readDVPLFile } from '../readDVPLFile';
import { readTexture } from '../readTexture';
import { TextureMutation } from '../readTexture/constants';
import {
  vertexAttributeGLTFName,
  vertexAttributeGltfVectorSizes,
} from './constants';

const ERROR_ON_UNKNOWN_COMPONENT = false;

const omitMeshNames = {
  start: ['chassis_chassis_', 'chassis_track_crash_', 'HP_'],
  end: ['_POINT'],
};

export async function extractModel(data: string, path: string) {
  const sc2Path = `${data}/3d/${path}.sc2.dvpl`;
  const scgPath = `${data}/3d/${path}.scg.dvpl`;
  const sc2 = new Sc2ReadStream(
    (await readDVPLFile(sc2Path)).buffer as ArrayBuffer,
  ).sc2();
  const scg = new ScgReadStream(
    (await readDVPLFile(scgPath)).buffer as ArrayBuffer,
  ).scg();
  const document = new Document();
  const scene = document.createScene();
  const buffer = document.createBuffer();
  const materials = new Map<bigint, Material | bigint | undefined>();

  // create materials
  await Promise.all(
    sc2['#dataNodes'].map(async (node) => {
      const id = new DataView(node['#id']).getBigUint64(0, true);

      if (node.parentMaterialKey !== undefined) {
        /**
         * material depends on a parent and doesn't seem to have any
         * properties so we just point it to the parent
         */
        materials.set(id, node.parentMaterialKey);
        return;
      }

      const material = document.createMaterial(node.materialName);
      let textures: Textures | undefined = undefined;

      if (node.textures) {
        textures = node.textures;
      } else if (typeof node.configCount === 'number') {
        textures = node.configArchive_0.textures;
      }

      if (textures) {
        material.setBaseColorTexture(
          document
            .createTexture(node.materialName)
            .setMimeType('image/jpeg')
            .setImage(
              await readTexture(
                `${data}/3d/${dirname(path)}/${textures.albedo}`,
                TextureMutation.Albedo,
              ),
            ),
        );

        if (textures.baseRMMap) {
          material.setMetallicRoughnessTexture(
            document
              .createTexture(node.materialName)
              .setMimeType('image/jpeg')
              .setImage(
                await readTexture(
                  `${data}/3d/${dirname(path)}/${textures.baseRMMap}`,
                  TextureMutation.RoughnessMetallicness,
                ),
              ),
          );
        }

        if (textures.baseNormalMap ?? textures.normalmap) {
          const isBase = textures.baseNormalMap !== undefined;

          material.setNormalTexture(
            document
              .createTexture(node.materialName)
              .setMimeType('image/jpeg')
              .setImage(
                await readTexture(
                  `${data}/3d/${dirname(path)}/${
                    textures.baseNormalMap ?? textures.normalmap
                  }`,
                  isBase ? TextureMutation.Normal : undefined,
                ),
              ),
          );
        }

        if (textures.miscMap) {
          material.setOcclusionTexture(
            document
              .createTexture(node.materialName)
              .setMimeType('image/jpeg')
              .setImage(
                await readTexture(
                  `${data}/3d/${dirname(path)}/${textures.miscMap}`,
                  TextureMutation.Miscellaneous,
                ),
              ),
          );
        }

        materials.set(
          new DataView(node['#id']).getBigUint64(0, true),
          material,
        );
      }
    }),
  );

  // replace children materials with parents
  materials.forEach((material, id) => {
    if (typeof material !== 'bigint') return;

    let resolvedMaterial: Material | bigint | undefined = material;

    while (typeof resolvedMaterial === 'bigint') {
      const linkedParentMaterial = materials.get(resolvedMaterial);

      resolvedMaterial = linkedParentMaterial;
    }

    materials.set(id, resolvedMaterial);
  });

  function parseHierarchies(hierarchies: Hierarchy[], parent: Scene | Node) {
    hierarchies.forEach((hierarchy) => {
      if (
        omitMeshNames.start.some((omit) => hierarchy.name.startsWith(omit)) ||
        omitMeshNames.end.some((omit) => hierarchy.name.endsWith(omit))
      )
        return;

      const node = document.createNode(hierarchy.name);
      const components = times(
        hierarchy.components.count,
        (index) => hierarchy.components[index.toString().padStart(4, '0')],
      );

      components.forEach((component) => {
        switch (component['comp.typename']) {
          case 'LodComponent':
            // found and used later by transform component
            // TODO: lod component always shows up before transform component; cache it before parsing transform
            break;

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
            const renderObject = component['rc.renderObj'];

            times(renderObject['ro.batchCount'], (batchIndex): void => {
              const lodIndex = renderObject[`rb${batchIndex}.lodIndex`];

              if (lodIndex !== 0) return;

              const batchKey = batchIndex.toString().padStart(4, '0');
              const batch = renderObject['ro.batches'][batchKey];
              const material = materials.get(batch['rb.nmatname']);
              const polygonGroup = scg.get(batch['rb.datasource']);

              if (!(material instanceof Material)) {
                // probably shadow material
                return;
              }
              if (polygonGroup === undefined) {
                throw new Error(
                  `Missing polygon group ${batch['rb.datasource']}`,
                );
              }

              const lodNode = document.createNode(batchKey);
              const indicesAccessor = document
                .createAccessor()
                .setType('SCALAR')
                .setArray(new Uint16Array(polygonGroup.indices))
                .setBuffer(buffer);
              const primitive = document
                .createPrimitive()
                .setIndices(indicesAccessor)
                .setMaterial(material);
              const attributes = new Map<VertexAttribute, number[][]>();

              polygonGroup.vertices.forEach((vertex) => {
                vertex.forEach(({ attribute, value }) => {
                  if (!attributes.has(attribute)) {
                    attributes.set(attribute, []);
                  }

                  attributes.get(attribute)!.push(value);
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

              attributes.forEach((value, attribute) => {
                const name = vertexAttributeGLTFName[attribute];
                if (!name || primitive.getAttribute(name)) return;
                const vertexSize = vertexAttributeGltfVectorSizes[attribute];

                const attributeAccessor = document
                  .createAccessor(name)
                  .setType(vertexSize === 1 ? 'SCALAR' : `VEC${vertexSize}`)
                  .setArray(new Float32Array(value.flat()))
                  .setBuffer(buffer);
                primitive.setAttribute(name, attributeAccessor);
              });

              const mesh = document
                .createMesh(batch['##name'])
                .addPrimitive(primitive);
              lodNode.setMesh(mesh);
              node.addChild(lodNode);
            });

            break;
          }

          default: {
            if (ERROR_ON_UNKNOWN_COMPONENT) {
              throw new Error(
                `Unhandled component type: ${component['comp.typename']}`,
              );
            }
          }
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
