type Bit = 0 | 1;

export class BinaryStream {
  public index = 0;
  bits: Bit[] = [];

  constructor(buffer: Buffer) {
    for (let bufferIndex = 0; bufferIndex < buffer.length; bufferIndex++) {
      const byte = buffer[bufferIndex];

      for (let byteIndex = 7; byteIndex >= 0; byteIndex--) {
        this.bits.push(((byte >> byteIndex) & 1) as Bit);
      }
    }
  }

  skip(size: number) {
    this.index += size;
  }
  read(size: number) {
    if (this.index + size > this.bits.length) {
      throw new RangeError('Cannot read beyond end of stream');
    }

    return this.bits
      .slice(this.index, this.index + size)
      .reduce((accumulator, bit) => (accumulator << 1) | bit, 0 as number);
  }
  consume(size: number) {
    const value = this.read(size);
    this.skip(size);

    return value;
  }
}
