import { existsSync } from 'fs';
import { clamp } from 'lodash';
import sharp from 'sharp';
import { Vector3Tuple } from 'three';
import { readDVPLFile } from '../blitz/readDVPLFile';
import { DdsStream } from '../streams/dds';
import { PvrStream } from '../streams/pvr';

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
  const isDds = existsSync(ddsTexturePath);
  const resolvedTexturePath = isDds
    ? ddsTexturePath
    : ddsTexturePath.replace('.dds', '.pvr');
  const decompressedDvpl = await readDVPLFile(resolvedTexturePath);
  const raw = isDds
    ? await new DdsStream(decompressedDvpl).dds()
    : new PvrStream(decompressedDvpl).pvr();
  const channels = 4 * raw.width * raw.height;

  switch (options?.mutation) {
    case TextureMutation.Normal: {
      for (let index = 0; index < channels; index += 4) {
        /**
         * Red is always 255 and blue is always 0. Only alpha and green contain any
         * sort of information.
         */
        let x = raw.data[index + 3] * (2 / 255) - 1;
        let y = raw.data[index + 1] * (2 / 255) - 1;
        const underSqrt = 1 - x ** 2 - y ** 2;
        let z = underSqrt > 0 ? Math.sqrt(underSqrt) : -Math.sqrt(-underSqrt);

        raw.data[index] = Math.round((x + 1) * (255 / 2));
        raw.data[index + 1] = Math.round((y + 1) * (255 / 2));
        raw.data[index + 2] = Math.round((z + 1) * (255 / 2));
        raw.data[index + 3] = 255;
      }

      break;
    }

    case TextureMutation.RoughnessMetallicness: {
      for (let index = 0; index < channels; index += 4) {
        /**
         * Same channel situation as normal maps.
         */
        const metallicness = raw.data[index + 1];
        const roughness = raw.data[index + 3];

        raw.data[index] = 0;
        raw.data[index + 1] = roughness;
        raw.data[index + 2] = metallicness;
        raw.data[index + 3] = 255;
      }

      break;
    }

    case TextureMutation.BaseColor: {
      for (let index = 0; index < channels; index += 4) {
        // treating as pre multiplied but I can't fully confirm

        const r = raw.data[index] / 255;
        const g = raw.data[index + 1] / 255;
        const b = raw.data[index + 2] / 255;
        const a = raw.data[index + 3] / 255;
        const invA = 1 - a;
        const rPrime = r + invA * options.baseColor[0];
        const gPrime = g + invA * options.baseColor[1];
        const bPrime = b + invA * options.baseColor[2];

        raw.data[index] = Math.round(clamp(rPrime * 255, 0, 255));
        raw.data[index + 1] = Math.round(clamp(gPrime * 255, 0, 255));
        raw.data[index + 2] = Math.round(clamp(bPrime * 255, 0, 255));
        raw.data[index + 3] = 255;
      }

      break;
    }
  }

  return await sharp(raw.data, { raw: raw }).png().toBuffer();
}
