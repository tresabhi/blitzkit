import { Resvg } from "@resvg/resvg-js";

export default function svgToPng(svg: string) {
  return new Resvg(svg).render().asPng()
}