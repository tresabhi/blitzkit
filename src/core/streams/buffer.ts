export class ReadStream {
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
    this.skip(size);

    return subarray;
  }
  increment(size: number) {
    return (this.index += size) - size;
  }

  readRemaining() {
    return this.read(Number.POSITIVE_INFINITY);
  }
  readRemainingLength() {
    return this.buffer.length - this.index;
  }
  consumeRemaining() {
    return this.consume(Number.POSITIVE_INFINITY);
  }

  byte(size: number) {
    return this.consume(size);
  }

  ascii(size: number) {
    return this.buffer.toString('ascii', this.increment(size), this.index);
  }

  int8() {
    return this.buffer.readInt8(this.increment(1));
  }
  int16() {
    return this.buffer.readInt16LE(this.increment(2));
  }
  int32() {
    return this.buffer.readInt32LE(this.increment(4));
  }
  int64() {
    return this.buffer.readBigInt64LE(this.increment(8));
  }
  uint8() {
    return this.buffer.readUInt8(this.increment(1));
  }
  uint16() {
    return this.buffer.readUInt16LE(this.increment(2));
  }
  uint32() {
    return this.buffer.readUInt32LE(this.increment(4));
  }
  uint64() {
    return this.buffer.readBigUInt64LE(this.increment(8));
  }
  float32() {
    return this.buffer.readFloatLE(this.increment(4));
  }
  float64() {
    return this.buffer.readDoubleLE(this.increment(8));
  }

  boolean() {
    return this.buffer.readUInt8(this.increment(1)) === 1;
  }
}

export class WriteStream {
  private array: number[] = [];

  get buffer() {
    return Buffer.from(this.array);
  }

  constructor(buffer?: Buffer) {
    if (buffer) this.array = Array.from(buffer);
  }

  byte(value: Uint8Array) {
    this.array.push(...value);
    return this;
  }

  ascii(value: string) {
    for (let index = 0; index < value.length; index++) {
      this.array.push(value.charCodeAt(index));
    }
    return this;
  }

  private uintN(bytes: number, value: number) {
    for (let index = 0; index < bytes; index++) {
      this.array.push((value >>> (8 * index)) & 0xff);
    }
    return this;
  }
  uint8(value: number) {
    this.uintN(1, value);
    return this;
  }
  uint16(value: number) {
    this.uintN(2, value);
    return this;
  }
  uint32(value: number) {
    this.uintN(4, value);
    return this;
  }
  uint64(value: bigint) {
    for (let index = 0n; index < 8n; index++) {
      this.uint8(Number((value >> (8n * index)) & 0xffn));
    }
    return this;
  }
  private intN(bytes: number, value: number) {
    for (let index = 0; index < bytes; index++) {
      this.array.push((value >> (8 * index)) & 0xff);
    }
    return this;
  }
  int8(value: number) {
    this.intN(1, value);
    return this;
  }
  int16(value: number) {
    this.intN(2, value);
    return this;
  }
  int32(value: number) {
    this.intN(4, value);
    return this;
  }
  int64(value: bigint) {
    for (let index = 0n; index < 8n; index++) {
      this.int8(Number((value >> (8n * index)) & 0xffn));
    }
    return this;
  }
  float32(value: number) {
    const array = new Float32Array([value]);
    this.array.push(...new Uint8Array(array.buffer));
    return this;
  }
  float64(value: number) {
    const array = new Float64Array([value]);
    this.array.push(...new Uint8Array(array.buffer));
    return this;
  }
}
