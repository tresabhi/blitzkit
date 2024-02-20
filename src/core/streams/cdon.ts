import { times } from 'lodash';
import { ReadStream, WriteStream } from './buffer';

enum ValueType {
  Null,
  Boolean,
  Uint8,
  Uint16,
  Uint32,
  Uint64,
  Int8,
  Int16,
  Int32,
  Int64,
  Float32,
  Float64,
  String,
  FastString,
  Array,
  Object,
}

enum FastStringFormat {
  Format8,
  Format16,
  Format32,
}

export type CdonValue =
  | null
  | boolean
  | number
  | bigint
  | string
  | CdonValue[]
  | { [key: string]: CdonValue };

export class CdonReadStream extends ReadStream {
  cdon() {
    this.magic();
    const header = this.header();
    const body = this.body(header.fastStringFormat, header.stringTable);
    return body;
  }

  magic() {
    const magic = this.utf8(4);

    if (magic !== 'CDON') {
      throw new Error(`Invalid Cdon magic number: "${magic}"`);
    }
  }

  header() {
    const version = this.uint16();
    const fastStringFormat = this.uint8() as FastStringFormat;

    return {
      version,
      fastStringFormat,
      stringTable: this.stringTable(fastStringFormat),
    };
  }

  body(
    fastStringFormat: FastStringFormat,
    stringTable: Record<number, string>,
  ) {
    return this.value(fastStringFormat, stringTable);
  }

  stringTable(fastStringFormat: FastStringFormat) {
    let count: number;

    switch (fastStringFormat) {
      case FastStringFormat.Format8:
        count = this.uint8();
        break;

      case FastStringFormat.Format16:
        count = this.uint16();
        break;

      case FastStringFormat.Format32:
        count = this.uint32();
        break;
    }

    const strings: string[] = [];

    for (let index = 0; index < count; index++) {
      strings.push(this.string());
    }

    const table: Record<number, string> = {};
    times(count, (index) => (table[index] = strings[index]));

    return table;
  }

  string() {
    const length = this.uint32();
    const string = this.utf8(length);
    return string;
  }

  value(
    fastStringFormat: FastStringFormat,
    stringTable: Record<number, string>,
  ): CdonValue {
    const type = this.uint8() as ValueType;

    switch (type) {
      case ValueType.Null:
        return null;

      case ValueType.Boolean:
        return this.boolean();

      case ValueType.Uint8:
        return this.uint8();

      case ValueType.Uint16:
        return this.uint16();

      case ValueType.Uint32:
        return this.uint32();

      case ValueType.Uint64:
        return this.uint64();

      case ValueType.Int8:
        return this.int8();

      case ValueType.Int16:
        return this.int16();

      case ValueType.Int32:
        return this.int32();

      case ValueType.Int64:
        return this.int64();

      case ValueType.Float32:
        return this.float32();

      case ValueType.Float64:
        return this.float64();

      case ValueType.String:
        return this.string();

      case ValueType.FastString: {
        switch (fastStringFormat) {
          case FastStringFormat.Format8:
            return stringTable[this.uint8()];

          case FastStringFormat.Format16:
            return stringTable[this.uint16()];

          case FastStringFormat.Format32:
            return stringTable[this.uint32()];
        }
      }

      case ValueType.Array:
        return times(this.uint32(), () =>
          this.value(fastStringFormat, stringTable),
        );

      case ValueType.Object: {
        const count = this.uint32();
        const keys = times(
          count,
          () => this.value(fastStringFormat, stringTable) as string,
        );
        const values = times(count, () =>
          this.value(fastStringFormat, stringTable),
        );
        const object: Record<string, CdonValue> = {};

        keys.forEach((string, index) => (object[string] = values[index]));

        return object;
      }

      default:
        throw new Error(`Invalid value type: ${type}`);
    }
  }
}

export class CdonWriteStream extends WriteStream {
  cdon(object: CdonValue) {
    this.magic();
    const header = this.header(object);
    this.body(header.fastStringFormat, object, header.stringTable);
    return this;
  }

  body(
    fastStringFormat: FastStringFormat,
    object: CdonValue,
    stringTable: Map<string, number>,
  ) {
    this.value(fastStringFormat, object, stringTable);
    return this;
  }

  value(
    fastStringFormat: FastStringFormat,
    object: CdonValue,
    stringTable: Map<string, number>,
  ) {
    if (object === null) {
      this.uint8(ValueType.Null);
    } else if (typeof object === 'boolean') {
      this.uint8(ValueType.Boolean);
      this.uint8(object ? 1 : 0);
    } else if (typeof object === 'number') {
      if (object % 1 === 0) {
        if (object < 0) {
          if (object < -0x80000000) {
            this.uint8(ValueType.Int64);
            this.int64(BigInt(object));
          } else if (object < -0x8000) {
            this.uint8(ValueType.Int32);
            this.int32(object);
          } else if (object < -0x80) {
            this.uint8(ValueType.Int16);
            this.int16(object);
          } else {
            this.uint8(ValueType.Int8);
            this.int8(object);
          }
        } else {
          if (object > 0x7fffffff) {
            this.uint8(ValueType.Uint64);
            this.uint64(BigInt(object));
          } else if (object > 0x7fff) {
            this.uint8(ValueType.Uint32);
            this.uint32(object);
          } else if (object > 0x7f) {
            this.uint8(ValueType.Uint16);
            this.uint16(object);
          } else {
            this.uint8(ValueType.Uint8);
            this.uint8(object);
          }
        }
      } else {
        if (object < -0x80000000 || object > 0x7fffffff) {
          this.uint8(ValueType.Float64);
          this.float64(object);
        } else {
          this.uint8(ValueType.Float32);
          this.float32(object);
        }
      }
    } else if (typeof object === 'bigint') {
      if (object < 0) {
        this.int64(object);
      } else {
        this.uint64(object);
      }
    } else if (typeof object === 'string') {
      if (stringTable.has(object)) {
        this.uint8(ValueType.FastString);
        const id = stringTable.get(object)!;
        switch (fastStringFormat) {
          case FastStringFormat.Format8:
            this.uint8(id);
            break;

          case FastStringFormat.Format16:
            this.uint16(id);
            break;

          case FastStringFormat.Format32:
            this.uint32(id);
        }
      } else {
        this.uint8(ValueType.String);
        this.string(object);
      }
    } else if (Array.isArray(object)) {
      this.uint8(ValueType.Array);
      this.uint32(object.length);
      object.forEach((value) =>
        this.value(fastStringFormat, value, stringTable),
      );
    } else if (object !== undefined) {
      const entries = Object.entries(object);

      this.uint8(ValueType.Object);
      this.uint32(entries.length);
      entries.forEach(([key]) =>
        this.value(fastStringFormat, key, stringTable),
      );
      entries.forEach(([, value]) =>
        this.value(fastStringFormat, value, stringTable),
      );
    }
  }

  header(object: CdonValue) {
    this.uint16(1);
    return this.stringTable(object);
  }

  stringTable(object: CdonValue) {
    const stringTable = this.buildStringTable(
      this.collectStringCounts(object, new Map()),
    );
    let fastStringFormat: FastStringFormat;

    if (stringTable.size <= 0xff) {
      fastStringFormat = FastStringFormat.Format8;
      this.uint8(FastStringFormat.Format8);
      this.uint8(stringTable.size);
    } else if (stringTable.size <= 0xffff) {
      fastStringFormat = FastStringFormat.Format16;
      this.uint8(FastStringFormat.Format16);
      this.uint16(stringTable.size);
    } else {
      fastStringFormat = FastStringFormat.Format32;
      this.uint8(FastStringFormat.Format32);
      this.uint32(stringTable.size);
    }

    stringTable.forEach((_index, string) => this.string(string));

    return { fastStringFormat, stringTable };
  }

  buildStringTable(stringCounts: Map<string, number>) {
    const stringTable = new Map<string, number>();

    stringCounts.forEach((count, string) => {
      if (count > 1) stringTable.set(string, stringTable.size);
    });

    return stringTable;
  }

  collectStringCounts(object: CdonValue, stringCounts: Map<string, number>) {
    if (typeof object === 'string') {
      if (stringCounts.has(object)) {
        stringCounts.set(object, stringCounts.get(object)! + 1);
      } else {
        stringCounts.set(object, 1);
      }
    } else if (object instanceof Array) {
      object.forEach((value) => this.collectStringCounts(value, stringCounts));
    } else if (object instanceof Object) {
      Object.entries(object).forEach((strings) =>
        this.collectStringCounts(strings, stringCounts),
      );
    }

    return stringCounts;
  }

  string(value: string) {
    this.uint32(Buffer.byteLength(value));
    this.utf8(value);
  }

  magic() {
    this.utf8('CDON');
  }
}
