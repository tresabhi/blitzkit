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

    // writeFile(
    //   'test.scg.txt',
    //   polygonGroupsRaw
    //     .map((polygonGroupRaw) => {
    //       const floats: number[] = [];
    //       const stream = new BufferStream(polygonGroupRaw.vertices);

    //       while (stream.readRemainingLength()) {
    //         floats.push(stream.float());
    //       }

    //       return `format: ${polygonGroupRaw.vertexFormat.toString(
    //         2,
    //       )}\n\n${floats.join('\n')}`;
    //     })
    //     .join('\n\n#####\n\n'),
    // );

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
      const { format, stride } = ScgStream.parseVertexFormat(
        polygonGroupRaw.vertexFormat,
      );
      const strideBasedSize = stride * polygonGroupRaw.vertexCount;

      if (verticesStream.stream.length !== strideBasedSize) {
        console.warn(
          `Vertex stride mismatch; expected ${strideBasedSize}, got ${verticesStream.stream.length}; skipping...`,
        );

        return;
      }

      for (let index = 0; index < polygonGroupRaw.vertexCount; index++) {
        vertices[index] = format.map((attribute) => {
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

  static parseVertexFormat(formatInt: number) {
    const format: VertexAttribute[] = [];
    let stride = 0;

    Object.values(VertexAttribute)
      .filter((value) => typeof value === 'number')
      .forEach((attributeUntyped) => {
        const attribute = attributeUntyped as VertexAttribute;
        const mask = 1 << attribute;

        if (formatInt & mask) {
          format.push(attribute);
          stride += vertexAttributeVectorSizes[attribute] * 4;
        }
      });

    return { format, stride };
  }
}
