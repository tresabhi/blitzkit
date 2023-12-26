import { times } from 'lodash';
import { Vector4Tuple } from 'three';
import { BinaryStream } from './binary';

const MAX_UINT5 = 2 ** 5 - 1;
const MAX_UINT6 = 2 ** 6 - 1;

type InterpolationKey = 0b00 | 0b01 | 0b10 | 0b11;

export class Bc1Stream extends BinaryStream {
  color() {
    const r = this.consume(5) / MAX_UINT5;
    const g = this.consume(6) / MAX_UINT6;
    const b = this.consume(5) / MAX_UINT5;

    return [r, g, b, 1];
  }

  interpolation() {
    const color0 = this.color();
    const color1 = this.color();
    const color2 = color0.map(
      (channel0, index) => (channel0 + color1[index]) / 2,
    );
    const color3 = [...color2.slice(0, -1), 0];

    return {
      [0b00]: color0,
      [0b01]: color1,
      [0b10]: color2,
      [0b11]: color3,
    };
  }

  blockFloat() {
    const interpolation = this.interpolation();
    return times(16, () => interpolation[this.consume(2) as InterpolationKey]);
  }

  block() {
    return this.blockFloat().map(
      (pixel) =>
        pixel.map((channel) => Math.round(channel * 255)) as Vector4Tuple,
    );
  }

  blocks(count: number) {
    return times(count, () => this.block());
  }

  bc1(width: number, height: number) {
    if (width % 4 !== 0 || height % 4 !== 0) {
      throw new RangeError('Width and height must be divisible by 4');
    }

    const count = (width / 4) * (height / 4);
    const blocks = this.blocks(count);
    const image = Buffer.alloc(width * height * 4);
    let pixelIndex = 0;

    for (let y = 0; y < width; y++) {
      const yOffset = Math.floor(y / 4) * (width / 4);

      for (let x = 0; x < height; x++) {
        const xOffset = Math.floor(x / 4);
        const block = blocks[yOffset + xOffset];
        const pixel = block[Math.floor(y % 4) * 4 + Math.floor(x % 4)];

        pixel.forEach((channel) => (image[pixelIndex++] = channel));
      }
    }

    return image;
  }
}
