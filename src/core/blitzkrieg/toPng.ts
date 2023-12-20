import { exec } from 'child_process';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { generateUUID } from 'three/src/math/MathUtils';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface ToPngOptions {
  format: string;
  alpha: boolean;
}

const toPngDefaultOptions: ToPngOptions = {
  format: 'dds',
  alpha: true,
};

export async function toPng(
  inputBuffer: Buffer,
  options?: Partial<ToPngOptions>,
) {
  const mergedOptions = { ...toPngDefaultOptions, ...options };
  const id = generateUUID();
  await mkdir('temp/toPng', { recursive: true });
  await writeFile(`temp/toPng/${id}.${mergedOptions.format}`, inputBuffer);
  await execPromise(
    `PVRTexToolCLI -noout -i temp/toPng/${id}.${mergedOptions.format} -f ${
      mergedOptions.alpha ? 'r8g8b8a8' : 'r8g8b8'
    },UB,sRGB -d temp/toPng/${id}.png`,
  );

  const pngBuffer = await readFile(`temp/toPng/${id}.png`);

  rm(`temp/toPng/${id}.${mergedOptions.format}`);
  rm(`temp/toPng/${id}.png`);

  return pngBuffer;
}
