export class ReadStream {
  public index = 0;
  private dataView: DataView;
  private textDecoderAscii = new TextDecoder('ascii');
  private textDecoderUtf8 = new TextDecoder('utf8');

  constructor(public buffer: ArrayBuffer) {
    this.dataView = new DataView(buffer);
  }

  seek(size: number) {
    this.index += size;
  }
  read(size: number) {
    return this.buffer.slice(this.index, this.index + size);
  }
  consume(size: number) {
    const subarray = this.read(size);
    this.seek(size);
    return subarray;
  }
  consumeUint8Array(size: number) {
    return new Uint8Array(this.consume(size));
  }
  increment(size: number) {
    return (this.index += size) - size;
  }

  readRemaining() {
    return this.read(Number.POSITIVE_INFINITY);
  }
  consumeRemaining() {
    return this.consume(Number.POSITIVE_INFINITY);
  }

  byte(size: number) {
    return this.consume(size);
  }

  ascii(size: number) {
    return this.textDecoderAscii.decode(this.consume(size));
  }
  utf8(size: number) {
    return this.textDecoderUtf8.decode(this.consume(size));
  }

  int8() {
    return this.dataView.getInt8(this.increment(1));
  }
  int16() {
    return this.dataView.getInt16(this.increment(2), true);
  }
  int32() {
    return this.dataView.getInt32(this.increment(4), true);
  }
  int64() {
    return this.dataView.getBigInt64(this.increment(8), true);
  }
  uint8() {
    return this.dataView.getUint8(this.increment(1));
  }
  uint16() {
    return this.dataView.getUint16(this.increment(2), true);
  }
  uint32() {
    return this.dataView.getUint32(this.increment(4), true);
  }
  uint64() {
    return this.dataView.getBigUint64(this.increment(8), true);
  }
  float32() {
    return this.dataView.getFloat32(this.increment(4), true);
  }
  float64() {
    return this.dataView.getFloat64(this.increment(8), true);
  }

  boolean() {
    return this.dataView.getUint8(this.increment(1)) === 1;
  }
}

export class WriteStream {
  private array: number[] = [];
  private textEncoder = new TextEncoder();

  get uint8Array() {
    return new Uint8Array(this.array);
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
  utf8(value: string) {
    this.array.push(...this.textEncoder.encode(value));
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
