import { Document, Material, Node, Scene } from '@gltf-transform/core';
import { range, times } from 'lodash';
import { dirname } from 'path';
import {
  Matrix4,
  Quaternion,
  Vector3,
  Vector3Tuple,
  Vector4Tuple,
} from 'three';
import { TextureMutation, readTexture } from '../blitzkrieg/readTexture';
import { Hierarchy, Sc2Stream, Textures } from '../streams/sc2';
import { ScgStream, vertexAttributeVectorSizes } from '../streams/scg';
import { VertexAttribute } from '../streams/scpg';
import { readDVPLFile } from './readDVPLFile';

const ERROR_ON_UNKNOWN_COMPONENT = false;
const MAX_FLOAT32 = 2 ** 127 * (2 - 2 ** -23);

export const vertexAttributeGLTFName: Partial<Record<VertexAttribute, string>> =
  {
    [VertexAttribute.VERTEX]: 'POSITION',
    [VertexAttribute.NORMAL]: 'NORMAL',
    [VertexAttribute.TEXCOORD0]: 'TEXCOORD_0',
    [VertexAttribute.TEXCOORD1]: 'TEXCOORD_0',
    [VertexAttribute.TEXCOORD2]: 'TEXCOORD_0',
    [VertexAttribute.TEXCOORD3]: 'TEXCOORD_0',
    [VertexAttribute.TANGENT]: 'TANGENT',
    [VertexAttribute.JOINTINDEX]: 'JOINT_0',
    [VertexAttribute.JOINTWEIGHT]: 'WEIGHT_0',
  };

export const vertexAttributeGltfVectorSizes = {
  ...vertexAttributeVectorSizes,

  [VertexAttribute.TANGENT]: 4,
} as const;

const omitMeshNames = {
  start: ['chassis_chassis_', 'chassis_track_crash_', 'HP_'],
  end: ['_POINT'],
};

export async function extractModel(
  data: string,
  path: string,
  baseColor?: Vector3Tuple,
) {
  const sc2Path = `${data}/3d/${path}.sc2.dvpl`;
  const scgPath = `${data}/3d/${path}.scg.dvpl`;
  const sc2 = new Sc2Stream(await readDVPLFile(sc2Path)).sc2();
  const scg = new ScgStream(await readDVPLFile(scgPath)).scg();
  const document = new Document();
  const scene = document.createScene();
  const buffer = document.createBuffer();
  const materials = new Map<bigint, Material | bigint>();

  // create materials
  await Promise.all(
    sc2['#dataNodes'].map(async (node) => {
      const id = node['#id'].readBigUInt64LE();

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
            .setMimeType('image/png')
            .setImage(
              await readTexture(
                `${data}/3d/${dirname(path)}/${textures.albedo}`,
                baseColor
                  ? { mutation: TextureMutation.BaseColor, baseColor }
                  : undefined,
              ),
            ),
        );

        if (textures.baseRMMap) {
          material.setMetallicRoughnessTexture(
            document
              .createTexture(node.materialName)
              .setMimeType('image/png')
              .setImage(
                await readTexture(
                  `${data}/3d/${dirname(path)}/${textures.baseRMMap}`,
                  { mutation: TextureMutation.RoughnessMetallicness },
                ),
              ),
          );
        }

        if (textures.baseNormalMap ?? textures.normalmap) {
          const isBase = textures.baseNormalMap !== undefined;

          material.setNormalTexture(
            document
              .createTexture(node.materialName)
              .setMimeType('image/png')
              .setImage(
                await readTexture(
                  `${data}/3d/${dirname(path)}/${
                    textures.baseNormalMap ?? textures.normalmap
                  }`,
                  isBase ? { mutation: TextureMutation.Normal } : undefined,
                ),
              ),
          );
        }
      }

      materials.set(node['#id'].readBigUInt64LE(), material);
    }),
  );

  // replace children materials with parents
  materials.forEach((material, id) => {
    if (typeof material !== 'bigint') return;

    let resolvedMaterial: Material | bigint = material;

    while (typeof resolvedMaterial === 'bigint') {
      const linkedParentMaterial = materials.get(resolvedMaterial);

      if (linkedParentMaterial === undefined) {
        throw new Error('Could not resolve material');
      }

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
          case 'TransformComponent': {
            const translation = new Vector3();
            const rotation = new Quaternion();
            const scale = new Vector3();

            if (
              !component['tc.worldTranslation'] ||
              !component['tc.worldScale'] ||
              !component['tc.localTranslation'] ||
              !component['tc.localScale']
            ) {
              console.log(component);
            }

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
            let minLODDistanceBatchId: undefined | number;

            if (component['rc.renderObj']['rb0.lodIndex'] === -1) {
              minLODDistanceBatchId = 0;
            } else {
              const lodList = components.find(
                (component) => component['comp.typename'] === 'LodComponent',
              );

              if (
                lodList === undefined ||
                lodList['comp.typename'] !== 'LodComponent' // type annotation hack
              ) {
                throw new SyntaxError('Missing LodComponent');
              }

              let minLODDistance = Infinity;
              let isFirstMaxFloat = true;
              let lodIndexStreak = 0;
              let lodIndexStreakIndex: undefined | number = undefined;

              range(component['rc.renderObj']['ro.batchCount']).forEach(
                (id) => {
                  const lodIndex =
                    component['rc.renderObj'][`rb${id}.lodIndex`];
                  const lodDistance =
                    lodList['lc.loddist'][`distance${lodIndex}`];

                  if (lodIndexStreakIndex === lodIndex) {
                    lodIndexStreak++;
                  } else {
                    lodIndexStreak = 0;
                    lodIndexStreakIndex = lodIndex;
                  }

                  if (
                    lodDistance < minLODDistance ||
                    (lodDistance === minLODDistance && lodIndexStreak > 0) ||
                    (lodDistance === MAX_FLOAT32 && isFirstMaxFloat)
                  ) {
                    if (lodDistance === MAX_FLOAT32) isFirstMaxFloat = false;
                    minLODDistance = lodDistance;
                    minLODDistanceBatchId = id;
                  }
                },
              );
            }

            const batch =
              component['rc.renderObj']['ro.batches'][
                minLODDistanceBatchId!.toString().padStart(4, '0')
              ];
            const polygonGroup = scg.get(batch['rb.datasource']);

            if (!polygonGroup) {
              console.warn(
                `Missing polygon group ${batch['rb.datasource']} (${hierarchy.name}); skipping...`,
              );

              break;
            }

            const material = materials.get(batch['rb.nmatname']);

            if (!(material instanceof Material)) {
              throw new Error(`Material ${batch['rb.nmatname']} is unresolved`);
            }

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

            node.setMesh(mesh);

            break;
          }

          default: {
            const message = `Unhandled component type: ${component['comp.typename']}`;

            if (ERROR_ON_UNKNOWN_COMPONENT) {
              throw new Error(message);
            } else {
              console.warn(`${message}; skipping...`);
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
