import { times } from 'lodash';
import { SC2 } from '../../types/sc2';
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

export enum VertexAttribute {
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
  PIVOT_DEPRECATED,
  FLEXIBILITY,
  ANGLE_SIN_COS,
  JOINTINDEX,
  JOINTWEIGHT,
  CUBETEXCOORD0,
  CUBETEXCOORD1,
  CUBETEXCOORD2,
  CUBETEXCOORD3,
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
type BlitzkriegVertex = { type: VertexAttribute; value: number[] }[];
interface BlitzkriegPolygonGroup {
  id: bigint;
  vertices: BlitzkriegVertex[];
  indices: number[];
}

export class SCPGStream {
  public index = 0;
  constructor(public buffer: Buffer) {}

  skip(size: number) {
    this.index += size;
  }
  back(size: number) {
    this.skip(-size);
  }
  read(size: number) {
    return this.buffer.subarray(this.index, this.index + size);
  }
  consume(size: number) {
    const subarray = this.read(size);
    this.skip(size);

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
    return this.consume(4).readUInt32LE();
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

  consumeVectorN(size: number) {
    return times(size, () => this.consumeFloat());
  }
  consumeVector2() {
    return this.consumeVectorN(2);
  }
  consumeVector3() {
    return this.consumeVectorN(3);
  }
  consumeVector4() {
    return this.consumeVectorN(4);
  }

  consumeMatrixN(size: number) {
    return times(size, () => this.consumeVectorN(size));
  }
  consumeMatrix2() {
    return this.consumeMatrixN(2);
  }
  consumeMatrix3() {
    return this.consumeMatrixN(3);
  }
  consumeMatrix4() {
    return this.consumeMatrixN(4);
  }

  getVertexStride(vertexFormat: number) {
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
          polygonGroupRaw.indexFormat === 0
            ? indicesStream.consumeUInt16()
            : indicesStream.consumeUInt32(),
        );
      }

      const verticesStream = new SCPGStream(polygonGroupRaw.vertices);
      const vertices: BlitzkriegVertex[] = [];

      const vertexFormat = (
        polygonGroupRaw.vertexFormat
          .toString(2)
          .split('')
          .map((bitString, index) =>
            bitString === '1' ? index : null,
          ) as VertexAttribute[]
      ).filter((type) => type !== null);

      for (let index = 0; index < polygonGroupRaw.vertexCount; index++) {
        vertices[index] = vertexFormat.map((type) => ({
          type,
          value: verticesStream.consumeVectorN(
            vertexAttributeVectorSizes[type],
          ),
        }));
      }

      return {
        id: polygonGroupRaw['#id'].readBigUInt64LE(),
        vertices,
        indices,
      } satisfies BlitzkriegPolygonGroup;
    });

    return polygonGroups;
  }

  consumeSC2Header() {
    const header = {
      name: this.consumeAscii(4),
      version: this.consumeUInt32(),
      nodeCount: this.consumeUInt32(),
    };
    const versionTags = this.consumeKA();
    const descriptor = this.consumeSC2Descriptor();

    return { header, versionTags, descriptor };
  }
  consumeSC2Descriptor() {
    const size = this.consumeUInt32();
    const fileType = this.consumeUInt32();

    // other felids that we don't care about for some reason lol
    this.skip(size - 4);

    return { size, fileType };
  }
  consumeSC2() {
    this.consumeSC2Header();
    return this.consumeKA() as SC2;
  }

  consumeKAValue(
    type: KAType = this.consumeUInt8(),
    stringTable?: Record<number, string>,
  ): unknown {
    switch (type) {
      case KAType.NONE:
        return undefined;

      case KAType.FILEPATH:
      case KAType.STRING: {
        if (stringTable) {
          const id = this.consumeUInt32();
          return stringTable[id];
        } else {
          const length = this.consumeUInt32();
          return this.consumeAscii(length);
        }
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
  consumeKA(stringTable?: Record<number, string>) {
    this.skip(2); // "KA"
    const version = this.consumeUInt16();
    const pairs: Record<string, any> = {};

    if (version === 0x0001) {
      const count = this.consumeUInt32();

      for (let index = 0; index < count; index++) {
        const name = this.consumeKAValue(undefined, stringTable) as string;
        const value = this.consumeKAValue(undefined, stringTable);

        pairs[name] = value;
      }
    } else if (version === 0x0002) {
      const count = this.consumeUInt32();
      const strings: string[] = [];
      const stringTable: Record<number, string> = {};

      for (let index = 0; index < count; index++) {
        const length = this.consumeUInt16();
        const string = this.consumeAscii(length);

        strings.push(string);
      }

      for (let index = 0; index < count; index++) {
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
    } else if (version === 0x0102) {
      if (!stringTable) throw new Error('No string table provided');

      const count = this.consumeUInt32();

      for (let index = 0; index < count; index++) {
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
    } else if (version === 0xff02) {
      // same as 0x0102 but empty and with no count
      return {};
    } else throw new RangeError(`Unhandled KA version: ${version}`);

    return pairs;
  }

  static fromDVPL(buffer: Buffer) {
    return new SCPGStream(readDVPL(buffer));
  }

  static async fromDVPLFile(file: string) {
    return new SCPGStream(await readDVPLFile(file));
  }
}
