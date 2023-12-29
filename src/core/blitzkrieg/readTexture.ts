import { clamp } from 'lodash';
import sharp from 'sharp';
import { Vector3Tuple } from 'three';
import { readDVPLFile } from '../blitz/readDVPLFile';
import { DdsStream } from '../streams/dds';

export enum TextureMutation {
  Normal,
  RoughnessMetallicness,
  BaseColor,
}

type ReadTextureOptions =
  | {
      mutation: TextureMutation.Normal | TextureMutation.RoughnessMetallicness;
    }
  | {
      mutation: TextureMutation.BaseColor;
      /**
       * Normalized between 0 and 1
       */
      baseColor: Vector3Tuple;
    };

export async function readTexture(path: string, options?: ReadTextureOptions) {
  const ddsTexturePath = path.replace('.tex', '.dx11.dds.dvpl');
  const decompressedDvpl = await readDVPLFile(ddsTexturePath);
  const stream = new DdsStream(decompressedDvpl);
  const dds = await stream.dds();
  const channels = 4 * dds.width * dds.height;

  /**
   * Red is always 255 and blue is always 0. Only alpha and green contain any
   * sort of information.
   */
  switch (options?.mutation) {
    case TextureMutation.Normal: {
      for (let index = 0; index < channels; index += 4) {
        // TODO: this math is pretty sus and looks very goofy when rendered
        let x = dds.data[index + 3] * (2 / 255) - 1;
        let y = dds.data[index + 1] * (2 / 255) - 1;
        const underSqrt = 1 - x ** 2 - y ** 2;
        let z = underSqrt > 0 ? Math.sqrt(underSqrt) : -Math.sqrt(-underSqrt);

        dds.data[index] = Math.round((x + 1) * (255 / 2));
        dds.data[index + 1] = Math.round((y + 1) * (255 / 2));
        dds.data[index + 2] = Math.round((z + 1) * (255 / 2));
        dds.data[index + 3] = 255;
      }

      break;
    }

    case TextureMutation.RoughnessMetallicness: {
      for (let index = 0; index < channels; index += 4) {
        const metallicness = dds.data[index + 1];
        const roughness = dds.data[index + 3];

        dds.data[index] = 0;
        dds.data[index + 1] = roughness;
        dds.data[index + 2] = metallicness;
        dds.data[index + 3] = 255;
      }

      break;
    }

    case TextureMutation.BaseColor: {
      for (let index = 0; index < channels; index += 4) {
        // treating as pre multiplied but I can't fully confirm

        const r = dds.data[index] / 255;
        const g = dds.data[index + 1] / 255;
        const b = dds.data[index + 2] / 255;
        const a = dds.data[index + 3] / 255;
        const invA = 1 - a;
        const rPrime = invA * options.baseColor[0] + r;
        const gPrime = invA * options.baseColor[1] + g;
        const bPrime = invA * options.baseColor[2] + b;

        dds.data[index] = Math.round(clamp(rPrime * 255, 0, 255));
        dds.data[index + 1] = Math.round(clamp(gPrime * 255, 0, 255));
        dds.data[index + 2] = Math.round(clamp(bPrime * 255, 0, 255));
        dds.data[index + 3] = 255;
      }

      break;
    }
  }

  return await sharp(dds.data, { raw: dds }).png().toBuffer();

  // const isDds = existsSync(ddsTexturePath);
  // const resolvedTexturePath = isDds
  //   ? ddsTexturePath
  //   : ddsTexturePath.replace('.dds', '.pvr');
  // const decompressedTexture = await readDVPLFile(resolvedTexturePath);
  // const jpg = await toJpg(decompressedTexture, {
  //   ...options,
  //   format: isDds ? 'dds' : 'pvr',
  // });

  // return jpg;
}
