import { existsSync } from "fs";
import sharp from "sharp";
import { Vector3Tuple } from "three";
import { readDVPLFile } from "../blitz/readDVPLFile";
import { DdsStream } from "../streams/dds";
import { PvrStream } from "../streams/pvr";

export enum TextureMutation {
  Normal,
  RoughnessMetallicness,
  BaseColor,
  Miscellaneous,
}

type ReadTextureOptions =
  | {
      mutation:
        | TextureMutation.Normal
        | TextureMutation.RoughnessMetallicness
        | TextureMutation.Miscellaneous;
    }
  | {
      mutation: TextureMutation.BaseColor;
      /**
       * Normalized between 0 and 1
       */
      baseColor: Vector3Tuple;
    };

export async function readTexture(path: string, options?: ReadTextureOptions) {
  const ddsTexturePath = path.replace(".tex", ".dx11.dds.dvpl");
  const isDds = existsSync(ddsTexturePath);
  const resolvedTexturePath = isDds
    ? ddsTexturePath
    : ddsTexturePath.replace(".dds", ".pvr");
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

    case TextureMutation.Miscellaneous: {
      for (let index = 0; index < channels; index += 4) {
        /**
         * Green is ambient occlusion and alpha is emissive. But very few tanks
         * use emissive so I am ignoring it for now.
         */
        const occlusion = raw.data[index + 1];
        // const emissive = raw.data[index + 3];

        raw.data[index] = occlusion;
        raw.data[index + 1] = 0;
        raw.data[index + 2] = 0;
        raw.data[index + 3] = 255;
      }

      break;
    }

    case TextureMutation.BaseColor: {
      for (let index = 0; index < channels; index += 4) {
        // alpha map is specularity but I am ignoring it for now
        raw.data[index + 3] = 255;
      }

      break;
    }
  }

  return await sharp(raw.data, { raw: raw }).png().toBuffer();
}
