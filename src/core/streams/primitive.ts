export class PrimitiveStream {
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

  readRemaining() {
    return this.read(Number.POSITIVE_INFINITY);
  }
  readRemainingLength() {
    return this.buffer.length - this.index;
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

  int8() {
    return this.consume(1).readInt8();
  }
  int16() {
    return this.consume(2).readInt16LE();
  }
  int32() {
    return this.consume(4).readInt32LE();
  }
  int64() {
    return this.consume(8).readBigInt64LE();
  }
  uint8() {
    return this.consume(1).readUInt8();
  }
  uint16() {
    return this.consume(2).readUInt16LE();
  }
  uint32() {
    return this.consume(4).readUInt32LE();
  }
  uint64() {
    return this.consume(8).readBigUInt64LE();
  }
  float() {
    return this.consume(4).readFloatLE();
  }

  boolean() {
    return this.consume(1).readUInt8() === 1;
  }
}
