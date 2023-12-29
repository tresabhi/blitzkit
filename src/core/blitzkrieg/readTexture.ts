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
        let x = dds.data[index + 3] / 255;
        let y = dds.data[index + 1] / 255;
        let z = Math.sqrt(1 - x ** 2 - y ** 2);
        const hypot = Math.sqrt(x ** 2 + y ** 2 + z ** 2);

        if (isFinite(hypot)) {
          x /= hypot;
          y /= hypot;
          z /= hypot;
        }

        dds.data[index] = Math.round(x * 255);
        dds.data[index + 1] = Math.round(y * 255);
        dds.data[index + 2] = Math.round(z * 255);
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
        const r = dds.data[index] / 255;
        const g = dds.data[index + 1] / 255;
        const b = dds.data[index + 2] / 255;
        const a = dds.data[index + 3] / 255;
        const inverseA = 1 - a;
        const mixedR = a * r + inverseA * options.baseColor[0];
        const mixedG = a * g + inverseA * options.baseColor[1];
        const mixedB = a * b + inverseA * options.baseColor[2];

        dds.data[index] = mixedR * 255;
        dds.data[index + 1] = mixedG * 255;
        dds.data[index + 2] = mixedB * 255;
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
