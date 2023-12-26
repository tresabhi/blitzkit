import { times } from 'lodash';
import { Vector4Tuple } from 'three';
import { BitStream } from './bit';

const MAX_UINT5 = 2 ** 5 - 1;
const MAX_UINT6 = 2 ** 6 - 1;

type InterpolationKey = 0b00 | 0b01 | 0b10 | 0b11;

export class Bc1Stream extends BitStream {
  color() {
    const r = this.consume(5) / MAX_UINT5;
    const g = this.consume(6) / MAX_UINT6;
    const b = this.consume(5) / MAX_UINT5;

    return [r, g, b, 1];
  }

  interpolation() {
    const color0Numeric = this.readBytes(2).readUInt16LE();
    const color0 = this.color();
    const color1Numeric = this.readBytes(2).readUInt16LE();
    const color1 = this.color();
    const alpha = color0Numeric > color1Numeric;
    const color2 = color0.map((channel0, index) =>
      alpha
        ? (1 / 2) * channel0 + (1 / 2) * color1[index]
        : (2 / 3) * channel0 + (1 / 3) * color1[index],
    );
    const color3 = alpha
      ? [0, 0, 0, 0]
      : color0.map(
          (channel0, index) => (1 / 3) * channel0 + (2 / 3) * color1[index],
        );

    return {
      [0b00]: color0,
      [0b01]: color0,
      [0b10]: color0,
      [0b11]: color0,
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

    const blocks = this.blocks((width / 4) * (height / 4));
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
