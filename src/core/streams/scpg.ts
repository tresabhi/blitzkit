import { times } from 'lodash';
import { PrimitiveStream } from './primitive';

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
  TRANSFORM = 29,
}

export enum VertexAttribute {
  VERTEX = 0,
  NORMAL = 1,
  COLOR = 2,
  TEXCOORD0 = 3,
  TEXCOORD1 = 4,
  TEXCOORD2 = 5,
  TEXCOORD3 = 6,
  TANGENT = 7,
  BINORMAL = 8,
  HARD_JOINTINDEX = 9,
  PIVOT4 = 10,
  PIVOT_DEPRECATED = 11,
  FLEXIBILITY = 12,
  ANGLE_SIN_COS = 13,
  JOINTINDEX = 14,
  JOINTWEIGHT = 15,
  CUBETEXCOORD0 = 16,
  CUBETEXCOORD1 = 17,
  CUBETEXCOORD2 = 18,
  CUBETEXCOORD3 = 19,
}

export class ScpgStream extends PrimitiveStream {
  vectorN(size: number) {
    return times(size, () => this.float());
  }
  vector2() {
    return this.vectorN(2);
  }
  vector3() {
    return this.vectorN(3);
  }
  vector4() {
    return this.vectorN(4);
  }

  matrixN(size: number) {
    return times(size, () => this.vectorN(size));
  }
  matrix2() {
    return this.matrixN(2);
  }
  matrix3() {
    return this.matrixN(3);
  }
  matrix4() {
    return this.matrixN(4);
  }

  kaValue(
    type: KAType = this.uint8(),
    stringTable?: Record<number, string>,
  ): unknown {
    switch (type) {
      case KAType.NONE:
        return undefined;

      case KAType.FILEPATH:
      case KAType.STRING: {
        if (stringTable) {
          const id = this.uint32();
          return stringTable[id];
        } else {
          const length = this.uint32();
          return this.ascii(length);
        }
      }

      case KAType.BYTE_ARRAY: {
        const length = this.uint32();
        return this.byte(length);
      }

      case KAType.FLOAT:
        return this.float();

      case KAType.ARRAY: {
        const length = this.uint32();
        const value = [];

        for (let index = 0; index < length; index++) {
          value.push(this.kaValue(undefined, stringTable));
        }

        return value;
      }

      case KAType.KEYED_ARCHIVE: {
        this.skip(4); // UInt32 length of the nested archive in bytes

        return this.ka(stringTable);
      }

      case KAType.INT8:
        return this.int8();
      case KAType.INT16:
        return this.int16();
      case KAType.INT32:
        return this.int32();
      case KAType.INT64:
        return this.int64();
      case KAType.UINT8:
        return this.uint8();
      case KAType.UINT16:
        return this.uint16();
      case KAType.UINT32:
        return this.uint32();
      case KAType.UINT64:
        return this.uint64();

      case KAType.BOOLEAN:
        return this.boolean();

      case KAType.VECTOR2:
        return this.vector2();
      case KAType.VECTOR3:
        return this.vector3();
      case KAType.VECTOR4:
        return this.vector4();

      case KAType.COLOR:
        return this.vector4(); // as RGBA

      case KAType.MATRIX2:
        return this.matrix2();
      case KAType.MATRIX3:
        return this.matrix3();
      case KAType.MATRIX4:
        return this.matrix4();

      case KAType.AABBOX3: {
        const minimum = this.vector3();
        const maximum = this.vector3();

        return { minimum, maximum };
      }

      case KAType.FASTNAME: {
        if (!stringTable) throw new Error('No string table provided');
        const index = this.uint32();
        return stringTable[index];
      }

      case KAType.TRANSFORM: {
        const position = this.vector3();
        const scale = this.vector3();
        const rotation = this.vector4();

        return {
          position,
          scale,
          rotation,
        };
      }

      default:
        throw new TypeError(
          `Unhandled KA type: ${type} (${KAType[type] ?? 'unknown type'})`,
        );
    }
  }
  ka(stringTable?: Record<number, string>) {
    this.skip(2); // "KA"
    const version = this.uint16();
    const pairs: Record<string, any> = {};

    if (version === 0x0001) {
      const count = this.uint32();

      for (let index = 0; index < count; index++) {
        const name = this.kaValue(undefined, stringTable) as string;
        const value = this.kaValue(undefined, stringTable);

        pairs[name] = value;
      }
    } else if (version === 0x0002) {
      const count = this.uint32();
      const strings: string[] = [];
      const stringTable: Record<number, string> = {};

      for (let index = 0; index < count; index++) {
        const length = this.uint16();
        const string = this.ascii(length);

        strings.push(string);
      }

      for (let index = 0; index < count; index++) {
        const id = this.uint32();
        stringTable[id] = strings[index];
      }

      const nodeCount = this.uint32();

      for (let index = 0; index < nodeCount; index++) {
        const keyId = this.uint32();
        const value = this.kaValue(undefined, stringTable);
        const key = stringTable[keyId];

        pairs[key] = value;
      }
    } else if (version === 0x0102) {
      if (!stringTable) throw new Error('No string table provided');

      const count = this.uint32();

      for (let index = 0; index < count; index++) {
        const keyIndex = this.uint32();
        const key = stringTable[keyIndex];
        const valueType = this.uint8();

        if (valueType === KAType.STRING) {
          const valueIndex = this.uint32();
          const value = stringTable[valueIndex];
          pairs[key] = value;
        } else {
          const value = this.kaValue(valueType, stringTable);
          pairs[key] = value;
        }
      }
    } else if (version === 0xff02) {
      // same as 0x0102 but empty and with no count
      return {};
    } else throw new RangeError(`Unhandled KA version: ${version}`);

    return pairs;
  }
}
