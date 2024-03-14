import sharp from 'sharp';
import { tankIcon } from './tankIcon';

export async function tankIconPng(id: number) {
  const imageResponse = await fetch(tankIcon(id));
  const imageBufferWEBP = await imageResponse.arrayBuffer();
  const imageBufferPNG = await sharp(imageBufferWEBP).png().toBuffer();
  return `data:image/png;base64,${imageBufferPNG.toString('base64')}`;
}
