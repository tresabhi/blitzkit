import { writeFileSync } from 'fs';
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
  UNKNOWN1,
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

class SCPGStream {
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
      const polygonGroupRaw = this.consumeKA<PolygonGroupRaw>();
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
    return {
      name: this.consumeAscii(4),
      version: this.consumeUInt32(),
      nodeCount: this.consumeUInt32(),
    };
  }
  consumeSC2Descriptor() {
    const size = this.consumeUInt32();
    const fileType = this.consumeUInt32();

    this.skip(8); // other felids that we don't care about for some reason

    return { size, fileType };
  }
  consumeSC2() {
    const header = this.consumeSC2Header();
    const versionTags = this.consumeKA();
    const descriptor = this.consumeSC2Descriptor();
    const data = this.consumeKA();

    writeFileSync(
      'test.json',
      JSON.stringify(
        { header, versionTags, descriptor, data },
        (key, value) => (typeof value === 'bigint' ? value.toString() : value),
        2,
      ),
    );

    // console.log(data);
  }

  consumeKAHeader() {
    return {
      name: this.consumeAscii(2),
      version: this.consumeUInt16(),
      count: this.consumeUInt32(),
    };
  }
  consumeKAValue<Type>(
    type: KAType = this.consumeUInt8(),
    stringTable?: Record<number, string>,
  ): Type {
    switch (type) {
      case KAType.INT32:
        return this.consumeInt32() as Type;

      case KAType.STRING: {
        const length = this.consumeUInt32();
        return this.consumeAscii(length) as Type;
      }

      case KAType.BYTE_ARRAY: {
        const length = this.consumeUInt32();
        return this.consumeByteArray(length) as Type;
      }

      case KAType.FLOAT:
        return this.consumeFloat() as Type;

      case KAType.ARRAY: {
        const length = this.consumeUInt32();
        const value = [];

        for (let index = 0; index < length; index++) {
          value.push(this.consumeKAValue(undefined, stringTable));
        }

        return value as Type;
      }

      case KAType.KEYED_ARCHIVE: {
        this.skip(4); // the length

        const value = this.consumeKA<Type>(stringTable);

        return value;
      }

      case KAType.UINT64:
        return this.consumeUInt64() as Type;

      case KAType.UINT32:
        return this.consumeUInt32() as Type;

      case KAType.BOOLEAN:
        return this.consumeBoolean() as Type;

      case KAType.AABBOX3: {
        const minimum = range(3).map(() => this.consumeFloat());
        const maximum = range(3).map(() => this.consumeFloat());

        return { minimum, maximum } as Type;
      }

      case KAType.VECTOR4:
        return range(4).map(() => this.consumeFloat()) as Type;

      case KAType.VECTOR3:
        return range(3).map(() => this.consumeFloat()) as Type;

      case KAType.FASTNAME: {
        if (!stringTable) throw new Error('No string table provided');

        const index = this.consumeUInt32();

        return stringTable[index] as Type;
      }

      default:
        throw new TypeError(
          `Unknown KA type: ${type} (${KAType[type] ?? 'unknown type'})`,
        );
    }
  }
  consumeKAV1Pair(stringTable?: Record<number, string>) {
    const name = this.consumeKAValue<string>(undefined, stringTable);
    const value = this.consumeKAValue(undefined, stringTable);

    return { name, value };
  }
  consumeKA<Type>(stringTable?: Record<number, string>) {
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
    } else throw new SyntaxError(`Unhandled KA version: ${header.version}`);

    return pairs as Type;
  }
}

const stream = new SCPGStream(await readFile('test.sc2'));

stream.consumeSC2();
