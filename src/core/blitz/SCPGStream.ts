import { range } from 'lodash';
import { readDVPL } from './readDVPL';
import { readDVPLFile } from './readDVPLFile';

enum KAType {
  NONE = 0,
  BOOLEAN = 1,
  INT32 = 2,
  FLOAT = 3,
  STRING = 4,
  WIDE_STRING = 5,
  BYTE_ARRAY = 6,
  UINT32 = 7,
  KEYED_ARCHIVE = 8,
  INT64 = 9,
  UINT64 = 10,
  VECTOR2 = 11,
  VECTOR3 = 12,
  VECTOR4 = 13,
  MATRIX2 = 14,
  MATRIX3 = 15,
  MATRIX4 = 16,
  COLOR = 17,
  FASTNAME = 18,
  AABBOX3 = 19,
  FILEPATH = 20,
  FLOAT64 = 21,
  INT8 = 22,
  UINT8 = 23,
  INT16 = 24,
  UINT16 = 25,
  ARRAY = 27,
  UNCONFIRMED_TRANSFORM = 29,
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

interface SCPGBuffer {
  type: 'Buffer';
  data: number[];
}

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

interface PolygonGroup extends Omit<PolygonGroupRaw, 'indices'> {
  indices: number[];
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

export class SCPGStream {
  public index = 0;

  constructor(public buffer: Buffer) {}

  skip(size: number) {
    this.index += size;
  }
  read(size: number) {
    return this.buffer.subarray(this.index, this.index + size);
  }
  consume(size: number) {
    const subarray = this.read(size);
    this.index += size;

    return subarray;
  }

  readRemaining() {
    return this.read(Number.POSITIVE_INFINITY);
  }
  consumeRemaining() {
    return this.consume(Number.POSITIVE_INFINITY);
  }

  consumeByteArray(size: number) {
    return this.consume(size);
  }

  consumeAscii(size: number) {
    return this.consume(size).toString('ascii');
  }
  consumeUtf16(size: number) {
    return this.consume(size).toString('utf16le');
  }

  consumeInt8() {
    return this.consume(1).readInt8();
  }
  consumeInt16() {
    return this.consume(2).readInt16LE();
  }
  consumeInt32() {
    return this.consume(4).readInt32LE();
  }
  consumeInt64() {
    return this.consume(8).readBigInt64LE();
  }
  consumeUInt8() {
    return this.consume(1).readUInt8();
  }
  consumeUInt16() {
    return this.consume(2).readUInt16LE();
  }
  consumeUInt32() {
    const buffer = this.consume(4);
    const value = buffer.readUInt32LE();

    return value;
  }
  consumeUInt64() {
    return this.consume(8).readBigUInt64LE();
  }
  consumeFloat() {
    return this.consume(4).readFloatLE();
  }

  consumeBoolean() {
    return this.consume(1).readUInt8() === 1;
  }

  consumeVector2() {
    return [this.consumeFloat(), this.consumeFloat()];
  }
  consumeVector3() {
    return [...this.consumeVector2(), this.consumeFloat()];
  }
  consumeVector4() {
    return [...this.consumeVector3(), this.consumeFloat()];
  }

  consumeMatrix2() {
    return [this.consumeVector2(), this.consumeVector2()];
  }
  consumeMatrix3() {
    return [
      this.consumeVector3(),
      this.consumeVector3(),
      this.consumeVector3(),
    ];
  }
  consumeMatrix4() {
    return [
      this.consumeVector4(),
      this.consumeVector4(),
      this.consumeVector4(),
      this.consumeVector4(),
    ];
  }

  consumeSCGHeader() {
    return {
      name: this.consumeAscii(4),
      version: this.consumeUInt32(),
      nodeCount: this.consumeUInt32(),
      nodeCount2: this.consumeUInt32(),
    };
  }
  consumeSCG() {
    const header = this.consumeSCGHeader();
    const polygonGroupsRaw: PolygonGroupRaw[] = [];

    for (let index = 0; index < header.nodeCount; index++) {
      const polygonGroupRaw = this.consumeKA() as PolygonGroupRaw;
      polygonGroupsRaw.push(polygonGroupRaw);
    }

    const polygonGroups = polygonGroupsRaw.map((polygonGroupRaw) => {
      const indicesStream = new SCPGStream(polygonGroupRaw.indices);
      const indices: number[] = [];

      for (let index = 0; index < polygonGroupRaw.indexCount; index++) {
        indices.push(
          polygonGroupRaw.indexFormat
            ? indicesStream.consumeUInt32()
            : indicesStream.consumeUInt16(),
        );
      }

      const verticesStream = new SCPGStream(polygonGroupRaw.vertices);
      const vertexFormat = polygonGroupRaw.vertexFormat
        .toString(2)
        .padStart(8 * 8, '0')
        .split('')
        .map(parseInt)
        .map((bit, index) => (bit ? index : null))
        .filter((index) => index !== null) as VertexType[];
      const vertices: { type: VertexType; value: number[] }[] = [];

      for (let index = 0; index < polygonGroupRaw.vertexCount; index++) {
        vertexFormat.forEach((type) => {
          const resolved = VECTOR_SIZES.some((types, size) => {
            if (types.includes(type)) {
              vertices.push({
                type,
                value: range(size + 1).map(() => verticesStream.consumeFloat()),
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
    const header = {
      name: this.consumeAscii(4),
      version: this.consumeUInt32(),
      nodeCount: this.consumeUInt32(),
    };
    const version = this.consumeKA();
    const descriptor = this.consumeSC2Descriptor(header.version);

    return { header, version, descriptor };
  }
  consumeSC2Descriptor(version: number) {
    const size = this.consumeUInt32();
    const fileType = this.consumeUInt32();

    // other felids that we don't care about for some reason lol
    this.skip(size - 4);

    return { size, fileType };
  }
  consumeSC2() {
    this.consumeSC2Header();
    return this.consumeKA();
  }

  consumeKAHeader() {
    return {
      name: this.consumeAscii(2),
      version: this.consumeUInt16(),
      count: this.consumeUInt32(),
    };
  }
  // TODO: change return type
  consumeKAValue(
    type: KAType = this.consumeUInt8(),
    stringTable?: Record<number, string>,
  ): unknown {
    console.log(KAType[type]);

    switch (type) {
      case KAType.NONE:
        return undefined;

      case KAType.FILEPATH:
      case KAType.STRING: {
        const length = this.consumeUInt32();
        return this.consumeAscii(length);
      }

      case KAType.BYTE_ARRAY: {
        const length = this.consumeUInt32();
        return this.consumeByteArray(length);
      }

      case KAType.FLOAT:
        return this.consumeFloat();

      case KAType.ARRAY: {
        const length = this.consumeUInt32();
        const value = [];

        for (let index = 0; index < length; index++) {
          value.push(this.consumeKAValue(undefined, stringTable));
        }

        return value;
      }

      case KAType.KEYED_ARCHIVE: {
        this.skip(4); // UInt32 length of the nested archive in bytes

        return this.consumeKA(stringTable);
      }

      case KAType.INT8:
        return this.consumeInt8();
      case KAType.INT16:
        return this.consumeInt16();
      case KAType.INT32:
        return this.consumeInt32();
      case KAType.INT64:
        return this.consumeInt64();
      case KAType.UINT8:
        return this.consumeUInt8();
      case KAType.UINT16:
        return this.consumeUInt16();
      case KAType.UINT32:
        return this.consumeUInt32();
      case KAType.UINT64:
        return this.consumeUInt64();

      case KAType.BOOLEAN:
        return this.consumeBoolean();

      case KAType.VECTOR2:
        return this.consumeVector2();
      case KAType.VECTOR3:
        return this.consumeVector3();
      case KAType.VECTOR4:
        return this.consumeVector4();

      case KAType.COLOR:
        return this.consumeVector4(); // as RGBA

      case KAType.MATRIX2:
        return this.consumeMatrix2();
      case KAType.MATRIX3:
        return this.consumeMatrix3();
      case KAType.MATRIX4:
        return this.consumeMatrix4();

      case KAType.AABBOX3: {
        const minimum = this.consumeVector3();
        const maximum = this.consumeVector3();

        return { minimum, maximum };
      }

      case KAType.FASTNAME: {
        if (!stringTable) throw new Error('No string table provided');

        const index = this.consumeUInt32();

        return stringTable[index];
      }

      case KAType.UNCONFIRMED_TRANSFORM: {
        if (!stringTable) throw new Error('No string table provided');

        const position = this.consumeVector3();
        const scale = this.consumeVector3();
        const rotation = this.consumeVector3();
        const UNCONFIRMED_scalar = this.consumeFloat();

        return {
          position,
          scale,
          rotation,
          UNCONFIRMED_scalar,
        };
      }

      default:
        throw new TypeError(
          `Unhandled KA type: ${type} (${KAType[type] ?? 'unknown type'})`,
        );
    }
  }
  consumeKAV1Pair(stringTable?: Record<number, string>) {
    const name = this.consumeKAValue(undefined, stringTable) as string;
    const value = this.consumeKAValue(undefined, stringTable);

    return { name, value };
  }
  consumeKA(stringTable?: Record<number, string>) {
    const header = this.consumeKAHeader();
    const pairs: Record<string, any> = {};

    if (header.version === 1) {
      for (let index = 0; index < header.count; index++) {
        const { name, value } = this.consumeKAV1Pair();
        pairs[name] = value;
      }
    } else if (header.version === 2) {
      const strings: string[] = [];
      const stringTable: Record<number, string> = {};
      for (let index = 0; index < header.count; index++) {
        const length = this.consumeUInt16();
        const string = this.consumeAscii(length);

        strings.push(string);
      }

      for (let index = 0; index < header.count; index++) {
        const id = this.consumeUInt32();
        stringTable[id] = strings[index];
      }

      const nodeCount = this.consumeUInt32();
      for (let index = 0; index < nodeCount; index++) {
        const keyId = this.consumeUInt32();
        const value = this.consumeKAValue(undefined, stringTable);
        const key = stringTable[keyId];

        pairs[key] = value;
      }
    } else if (header.version === 258) {
      if (!stringTable) throw new Error('No string table provided');

      for (let index = 0; index < header.count; index++) {
        const keyIndex = this.consumeUInt32();
        const key = stringTable[keyIndex];
        const valueType = this.consumeUInt8();

        if (valueType === KAType.STRING) {
          const valueIndex = this.consumeUInt32();
          const value = stringTable[valueIndex];
          pairs[key] = value;
        } else {
          const value = this.consumeKAValue(valueType, stringTable);
          pairs[key] = value;
        }
      }
    } else throw new RangeError(`Unhandled KA version: ${header.version}`);

    return pairs;
  }

  static fromDVPL(buffer: Buffer) {
    return new SCPGStream(readDVPL(buffer));
  }

  static async fromDVPLFile(file: string) {
    return new SCPGStream(await readDVPLFile(file));
  }
}
