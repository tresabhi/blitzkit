import { Resvg } from '@resvg/resvg-js';

export function svgToPng(svg: string) {
  return new Resvg(svg).render().asPng();
}
