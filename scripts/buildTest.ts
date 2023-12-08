import { readFile } from 'fs/promises';
import { range } from 'lodash';

enum KAType {
  NONE,
  BOOLEAN,
  INT32,
  FLOAT,
  STRING,
  WIDE_STRING,
  BYTE_ARRAY,
  UINT32,
  KEYED_ARCHIVE,
  INT64,
  UINT64,
  VECTOR2,
  VECTOR3,
  VECTOR4,
  MATRIX2,
  MATRIX3,
  MATRIX4,
  COLOR,
  FASTNAME,
  AABBOX3,
  FILEPATH,
  FLOAT64,
  INT8,
  UINT8,
  INT16,
  UINT16,
  ARRAY,
}

enum VertexType {
  VERTEX,
  NORMAL,
  COLOR,
  TEXCOORD0,
  TEXCOORD1,
  TEXCOORD2,
  TEXCOORD3,
  TANGENT,
  BINORMAL,
  HARD_JOINTINDEX,
  PIVOT4,
  FLEXIBILITY,
  ANGLE_SIN_COS,
  JOINTINDEX,
  JOINTWEIGHT,
  CUBETEXCOORD0,
  CUBETEXCOORD1,
  CUBETEXCOORD2,
  CUBETEXCOORD3,
}

const VECTOR_SIZES = [
  [
    // vector 1; basically array of 1 number
    VertexType.COLOR,
    VertexType.FLEXIBILITY,
    VertexType.HARD_JOINTINDEX,
  ],
  [
    // vector 2; 2d vector
    VertexType.TEXCOORD0,
    VertexType.TEXCOORD1,
    VertexType.TEXCOORD2,
    VertexType.TEXCOORD3,
    VertexType.ANGLE_SIN_COS,
  ],
  [
    // vector 3; 3d vector
    VertexType.VERTEX,
    VertexType.NORMAL,
    // VertexType.TANGENT, MOVED TO 4
    VertexType.BINORMAL,
    VertexType.CUBETEXCOORD0,
    VertexType.CUBETEXCOORD1,
    VertexType.CUBETEXCOORD2,
    VertexType.CUBETEXCOORD3,
  ],
  [
    // vector 4; 4d vector or something more complex
    VertexType.TANGENT, // UNCONFIRMED
    VertexType.PIVOT4,
    VertexType.JOINTINDEX,
    VertexType.JOINTWEIGHT,
  ],
];

type KAResolvedValue<Type> = { buffer: Buffer; value: Type };

interface PolygonGroupRaw {
  '##name': KAResolvedValue<'PolygonGroup'>;
  '#id': KAResolvedValue<Buffer>;
  cubeTextureCoordCount: KAResolvedValue<number>;
  indexCount: KAResolvedValue<number>;
  indexFormat: KAResolvedValue<0 | 1>;
  indices: KAResolvedValue<Buffer>;
  packing: KAResolvedValue<0 | 1>;
  primitiveCount: KAResolvedValue<number>;
  rhi_primitiveType: KAResolvedValue<1 | 2 | 10>;
  textureCoordCount: KAResolvedValue<number>;
  vertexCount: KAResolvedValue<number>;
  vertexFormat: KAResolvedValue<number>;
  vertices: KAResolvedValue<Buffer>;
}

interface PolygonGroup extends Omit<PolygonGroupRaw, 'indices'> {
  indices: number[];
}

class SCPGStream {
  public index = 0;

  constructor(public buffer: Buffer) {}

  skip(size: number) {
    this.index += size;
  }
  consume(size: number) {
    const subarray = this.buffer.subarray(this.index, this.index + size);
    this.index += size;

    return subarray;
  }
  consumeRemaining() {
    return this.consume(Number.POSITIVE_INFINITY);
  }

  consumeByteArray(size: number) {
    const buffer = this.consume(size);
    return { buffer, value: buffer };
  }
  consumeAscii(size: number) {
    const buffer = this.consume(size);
    return { buffer, value: buffer.toString('ascii') };
  }
  consumeInt8() {
    const buffer = this.consume(1);
    return { buffer, value: buffer.readInt8() };
  }
  consumeInt16() {
    const buffer = this.consume(2);
    return { buffer, value: buffer.readInt16LE() };
  }
  consumeInt32() {
    const buffer = this.consume(4);
    return { buffer, value: buffer.readInt32LE() };
  }
  consumeUInt8() {
    const buffer = this.consume(1);
    return { buffer, value: buffer.readUInt8() };
  }
  consumeUInt16() {
    const buffer = this.consume(2);
    return { buffer, value: buffer.readUInt16LE() };
  }
  consumeUInt32() {
    const buffer = this.consume(4);
    return { buffer, value: buffer.readUInt32LE() };
  }
  consumeFloat() {
    const buffer = this.consume(4);
    return { buffer, value: buffer.readFloatLE() };
  }

  consumeSCGHeader() {
    return {
      name: this.consumeAscii(4).value,
      version: this.consumeUInt32().value,
      nodeCount: this.consumeUInt32().value,
      nodeCount2: this.consumeUInt32().value,
    };
  }
  consumeSCG() {
    const header = this.consumeSCGHeader();
    const polygonGroupsRaw: PolygonGroupRaw[] = [];

    for (let index = 0; index < header.nodeCount; index++) {
      const polygonGroupRaw = this.consumeKA<PolygonGroupRaw>();
      polygonGroupsRaw.push(polygonGroupRaw);
    }

    const polygonGroups = polygonGroupsRaw.map((polygonGroupRaw) => {
      const indicesStream = new SCPGStream(polygonGroupRaw.indices.value);
      const indices: number[] = [];

      for (let index = 0; index < polygonGroupRaw.indexCount.value; index++) {
        indices.push(
          polygonGroupRaw.indexFormat.value
            ? indicesStream.consumeUInt32().value
            : indicesStream.consumeUInt16().value,
        );
      }

      const verticesStream = new SCPGStream(polygonGroupRaw.vertices.buffer);
      const vertexFormat = BigInt(
        '0x' + polygonGroupRaw.vertexFormat.buffer.toString('hex'),
      )
        .toString(2)
        .padStart(polygonGroupRaw.vertexFormat.buffer.length * 8, '0')
        .split('')
        .map(parseInt)
        .map((bit, index) => (bit ? index : null))
        .filter((index) => index !== null) as VertexType[];
      const vertices: { type: VertexType; value: number[] }[] = [];

      for (let index = 0; index < polygonGroupRaw.vertexCount.value; index++) {
        vertexFormat.forEach((type) => {
          const resolved = VECTOR_SIZES.some((types, size) => {
            if (types.includes(type)) {
              vertices.push({
                type,
                value: range(size + 1).map(
                  () => verticesStream.consumeFloat().value,
                ),
              });

              return true;
            }
          });

          if (!resolved) {
            throw new TypeError(`Unknown vertex type: ${type}`);
          }
        });
      }

      return { vertices, indices };
    });

    return polygonGroups.map((group) => ({
      vertices: group.vertices
        .filter(({ type }) => type === VertexType.VERTEX)
        .map(({ value }) => value),
      indices: group.indices,
    }));
  }

  consumeSC2Header() {
    return {
      name: this.consumeAscii(4).value,
      version: this.consumeUInt32().value,
      nodeCount: this.consumeUInt32().value,
    };
  }
  consumeSC2Descriptor() {
    const size = this.consumeUInt32().value;
    const fileType = this.consumeUInt32().value;

    this.skip(8); // other felids that we don't care about for some reason

    console.log(this.consumeKA());
  }
  consumeSC2() {
    const header = this.consumeSC2Header();
    const versionTags = this.consumeKA();
    const descriptor = this.consumeSC2Descriptor();
  }

  consumeKAHeader() {
    return {
      name: this.consumeAscii(2).value,
      version: this.consumeUInt16().value,
      count: this.consumeUInt32().value,
    };
  }
  consumeKAValue() {
    const type = this.consumeUInt8().value;

    switch (type) {
      case KAType.INT32:
        return this.consumeInt32();

      case KAType.STRING: {
        const length = this.consumeUInt32();
        return this.consumeAscii(length.value);
      }

      case KAType.BYTE_ARRAY: {
        const length = this.consumeUInt32();
        return this.consumeByteArray(length.value);
      }

      default:
        throw new TypeError(`Unknown KA type: ${type}`);
    }
  }
  consumeKAV1Pair() {
    const name = this.consumeKAValue().value as string;
    const value = this.consumeKAValue();

    return { name, value };
  }
  consumeKA<Type>() {
    const header = this.consumeKAHeader();
    const pairs: Record<string, any> = {};

    if (header.version === 1) {
      for (let index = 0; index < header.count; index++) {
        const { name, value } = this.consumeKAV1Pair();
        pairs[name] = value;
      }
    } else if (header.version === 2) {
      for (let index = 0; index < header.count; index++) {
        const length = this.consumeUInt16().value;
        const string = this.consumeAscii(length);

        console.log(string.value);
      }
    } else throw new SyntaxError(`Unknown KA version: ${header.version}`);

    return pairs as Type;
  }
}

const stream = new SCPGStream(await readFile('test.sc2'));

stream.consumeSC2();
// console.log(stream.consumeSCG());
