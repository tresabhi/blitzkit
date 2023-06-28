const numberRegex = /\d+(\.\d+)?/g;

/**
 * Thanks to icl7126!
 * https://stackoverflow.com/a/44134328/12294756
 */
export default function hslToHex(hsl: string) {
  let [h, s, l] = Array.from(hsl.matchAll(numberRegex)).map((m) =>
    parseFloat(m[0]),
  );

  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0'); // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
