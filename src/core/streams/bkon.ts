import { times } from 'lodash';
import { ReadStream } from './buffer';

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
    const count = this.uint32();
    const keys = times(count, () => this.value(stringTable) as string);
    const values = times(count, () => this.value(stringTable));
    const body: Record<string, Value> = {};

    keys.forEach((key, index) => (body[key] = values[index]));

    return body;
  }

  stringTable() {
    const count = this.uint32();
    const ids = times(count, this.uint32);
    const strings = times(count, this.string);
    const table: Record<number, string> = {};

    ids.forEach((id, index) => (table[id] = strings[index]));

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
        return stringTable[this.uint32()];

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
