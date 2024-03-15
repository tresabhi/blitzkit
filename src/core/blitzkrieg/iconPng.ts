import sharp from 'sharp';

const cache: Record<string, string> = {};

export async function iconPng(url: string) {
  if (cache[url]) return cache[url];

  const imageResponse = await fetch(url);
  const imageBufferWEBP = await imageResponse.arrayBuffer();
  const imageBufferPNG = await sharp(imageBufferWEBP).png().toBuffer();
  cache[url] = `data:image/png;base64,${imageBufferPNG.toString('base64')}`;

  return cache[url];
}
