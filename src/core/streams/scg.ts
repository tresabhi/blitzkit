import { ScpgStream, VertexAttribute } from './scpg';

interface PolygonGroupRaw {
  '##name': 'PolygonGroup';
  '#id': Buffer;
  cubeTextureCoordCount: number;
  indexCount: number;
  indexFormat: 0 | 1;
  indices: Buffer;
  packing: 0 | 1;
  primitiveCount: number;
  rhi_primitiveType: 1 | 2 | 10;
  textureCoordCount: number;
  vertexCount: number;
  vertexFormat: number;
  vertices: Buffer;
}

type BlitzkriegVertex = { attribute: VertexAttribute; value: number[] }[];

interface BlitzkriegPolygonGroup {
  vertices: BlitzkriegVertex[];
  indices: number[];
}

export const vertexAttributeVectorSizes = {
  [VertexAttribute.VERTEX]: 3,
  [VertexAttribute.NORMAL]: 3,
  [VertexAttribute.COLOR]: 1,
  [VertexAttribute.TEXCOORD0]: 2,
  [VertexAttribute.TEXCOORD1]: 2,
  [VertexAttribute.TEXCOORD2]: 2,
  [VertexAttribute.TEXCOORD3]: 2,
  [VertexAttribute.TANGENT]: 3,
  [VertexAttribute.BINORMAL]: 3,
  [VertexAttribute.HARD_JOINTINDEX]: 1,
  [VertexAttribute.CUBETEXCOORD0]: 3,
  [VertexAttribute.CUBETEXCOORD1]: 3,
  [VertexAttribute.CUBETEXCOORD2]: 3,
  [VertexAttribute.CUBETEXCOORD3]: 3,
  [VertexAttribute.PIVOT4]: 4,
  [VertexAttribute.PIVOT_DEPRECATED]: 3,
  [VertexAttribute.FLEXIBILITY]: 1,
  [VertexAttribute.ANGLE_SIN_COS]: 2,
  [VertexAttribute.JOINTINDEX]: 4,
  [VertexAttribute.JOINTWEIGHT]: 4,
} as const;

export class ScgStream extends ScpgStream {
  header() {
    return {
      name: this.ascii(4),
      version: this.uint32(),
      nodeCount: this.uint32(),
      nodeCount2: this.uint32(),
    };
  }

  scg() {
    const header = this.header();
    const polygonGroupsRaw: PolygonGroupRaw[] = [];
    const polygonGroups = new Map<bigint, BlitzkriegPolygonGroup>();

    for (let index = 0; index < header.nodeCount; index++) {
      const polygonGroupRaw = this.ka() as PolygonGroupRaw;
      polygonGroupsRaw.push(polygonGroupRaw);
    }

    polygonGroupsRaw.forEach((polygonGroupRaw) => {
      const indicesStream = new ScpgStream(polygonGroupRaw.indices);
      const indices: number[] = [];

      for (let index = 0; index < polygonGroupRaw.indexCount; index++) {
        indices.push(
          polygonGroupRaw.indexFormat === 0
            ? indicesStream.uint16()
            : indicesStream.uint32(),
        );
      }

      const verticesStream = new ScpgStream(polygonGroupRaw.vertices);
      const vertices: BlitzkriegVertex[] = [];
      const stride =
        ScgStream.vertexStride(polygonGroupRaw.vertexFormat) *
        polygonGroupRaw.vertexCount;

      if (verticesStream.stream.length !== stride) {
        console.warn(
          `Vertex stride mismatch; expected ${stride}, got ${verticesStream.stream.length}; skipping...`,
        );

        return;
      }

      const vertexFormat = (
        polygonGroupRaw.vertexFormat
          .toString(2)
          .split('')
          .map((bitString, index) =>
            bitString === '1' ? index : null,
          ) as VertexAttribute[]
      ).filter((type) => type !== null);

      for (let index = 0; index < polygonGroupRaw.vertexCount; index++) {
        vertices[index] = vertexFormat.map((attribute) => {
          return {
            attribute,
            value: verticesStream.vectorN(
              vertexAttributeVectorSizes[attribute],
            ),
          };
        });
      }

      if (verticesStream.readRemainingLength() !== 0) {
        throw new RangeError('Vertices stream was not fully consumed');
      }

      polygonGroups.set(polygonGroupRaw['#id'].readBigUInt64LE(), {
        vertices,
        indices,
      });
    });

    return polygonGroups;
  }

  static vertexStride(vertexFormat: number) {
    const flags = vertexFormat.toString(2);

    return Object.values(VertexAttribute)
      .filter((value) => typeof value === 'number')
      .reduce(
        (accumulator, attribute) =>
          flags[attribute as VertexAttribute] === '1'
            ? accumulator +
              vertexAttributeVectorSizes[attribute as VertexAttribute] * 4
            : accumulator,
        0,
      );
  }
}
