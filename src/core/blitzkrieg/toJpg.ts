import { exec } from 'child_process';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { generateUUID } from 'three/src/math/MathUtils';
import { promisify } from 'util';

const execPromise = promisify(exec);

type Channel = 'red' | 'green' | 'blue' | 'alpha';

export interface ToJpgOptions {
  format: string;
  swap: [Channel, Channel][];
  invert: boolean;
}

const toJpgDefaultOptions: ToJpgOptions = {
  format: 'dds',
  swap: [],
  invert: false,
};

export async function toJpg(
  inputBuffer: Buffer,
  options?: Partial<ToJpgOptions>,
) {
  const mergedOptions = { ...toJpgDefaultOptions, ...options };
  const id = generateUUID();
  const input = `temp/toJpg/${id}.${mergedOptions.format}`;
  const output = `temp/toJpg/${id}.jpg`;
  const command = `PVRTexToolCLI -noout -i ${input} ${
    mergedOptions.swap.length === 0
      ? ''
      : mergedOptions.swap
          .map(
            (swapChannels) => `-${swapChannels[1]} ${input},${swapChannels[0]}`,
          )
          .join(' ')
  } ${
    mergedOptions.invert ? `-diff ${input},DIFFINVERT,255` : ''
  } -d ${output}`;

  console.log(command);

  await mkdir('temp/toJpg', { recursive: true });
  await writeFile(`temp/toJpg/${id}.${mergedOptions.format}`, inputBuffer);
  await execPromise(command);

  const jpgBuffer = await readFile(`temp/toJpg/${id}.jpg`);

  rm(`temp/toJpg/${id}.${mergedOptions.format}`);
  rm(`temp/toJpg/${id}.jpg`);

  return jpgBuffer;
}
