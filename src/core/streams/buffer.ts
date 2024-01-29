export class BufferStream {
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
  float() {
    return this.buffer.readFloatLE(this.increment(4));
  }

  boolean() {
    return this.buffer.readUInt8(this.increment(1)) === 1;
  }
}
