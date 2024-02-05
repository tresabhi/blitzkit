import { writeFile } from 'fs/promises';
import { times } from 'lodash';
import { decode, encode } from 'lz4';
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

type Value =
  | null
  | boolean
  | number
  | bigint
  | string
  | Value[]
  | { [key: string]: Value };

export class BkonReadStream extends ReadStream {
  bkon() {
    this.magic();
    const header = this.header();
    const body = this.body(header.stringTable);

    return body;
  }

  magic() {
    if (this.ascii(4) !== 'BKON') {
      throw new Error('Invalid BKON magic number');
    }
  }

  header() {
    return {
      version: this.uint16(),
      stringTable: this.stringTable(),
    };
  }

  body(stringTable: Record<number, string>) {
    return this.value(stringTable);
  }

  stringTable() {
    const count = this.uint16();
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
    const string = this.ascii(length);
    return string;
  }

  value(stringTable: Record<number, string>): Value {
    const type = this.uint8();

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

      case ValueType.FastString:
        return stringTable[this.uint16()];

      case ValueType.Array:
        return times(this.uint32(), () => this.value(stringTable));

      case ValueType.Object: {
        const count = this.uint32();
        const keys = times(count, () => this.value(stringTable) as string);
        const values = times(count, () => this.value(stringTable));
        const object: Record<string, Value> = {};

        keys.forEach((string, index) => (object[string] = values[index]));

        return object;
      }

      default:
        throw new Error(`Invalid value type: ${type}`);
    }
  }
}

export class BkonWriteStream extends WriteStream {
  bkon(object: Value) {
    this.magic();
    const stringTable = this.header(object);
    this.body(object, stringTable);
  }

  body(object: Value, stringTable: Map<string, number>) {
    this.value(object, stringTable);
  }

  value(object: Value, stringTable: Map<string, number>) {
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
        this.uint16(stringTable.get(object)!);
      } else {
        this.uint8(ValueType.String);
        this.string(object);
      }
    } else if (Array.isArray(object)) {
      this.uint8(ValueType.Array);
      this.uint32(object.length);
      object.forEach((value) => this.value(value, stringTable));
    } else {
      const entries = Object.entries(object);

      this.uint8(ValueType.Object);
      this.uint32(entries.length);
      entries.forEach(([key]) => this.value(key, stringTable));
      entries.forEach(([, value]) => this.value(value, stringTable));
    }
  }

  header(object: Value) {
    this.uint16(1);
    return this.stringTable(object);
  }

  stringTable(object: Value) {
    const stringTable = this.buildStringTable(
      this.collectStringCounts(object, new Map()),
    );

    this.uint16(stringTable.size);
    stringTable.forEach((_index, string) => this.string(string));

    return stringTable;
  }

  buildStringTable(stringCounts: Map<string, number>) {
    const stringTable = new Map<string, number>();

    stringCounts.forEach((count, string) => {
      if (count > 1) stringTable.set(string, stringTable.size);
    });

    return stringTable;
  }

  collectStringCounts(object: Value, stringCounts: Map<string, number>) {
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
    this.uint32(value.length);
    this.ascii(value);
  }

  magic() {
    this.ascii('BKON');
  }
}

const write = new BkonWriteStream();
const data = (await fetch(
  'https://raw.githubusercontent.com/tresabhi/blitzkrieg-assets/dev/definitions/tanks.json',
).then((response) => response.json())) as Value;
write.bkon(data);
const buffer = write.buffer;
const read = new BkonReadStream(buffer);
read.bkon();
const lz4 = encode(buffer);

writeFile('test.bkon', buffer);
writeFile('test.json', JSON.stringify(data));
writeFile('test.bkon.lz4', lz4);

// now we attempt to read it
writeFile(
  'test.read.json',
  JSON.stringify(new BkonReadStream(decode(lz4)).bkon()),
);
