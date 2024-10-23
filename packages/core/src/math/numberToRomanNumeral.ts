/**
 * Thanks, August!
 * https://stackoverflow.com/a/41358305/12294756
 */
const ROMAN = {
  M: 1000,
  CM: 900,
  D: 500,
  CD: 400,
  C: 100,
  XC: 90,
  L: 50,
  XL: 40,
  X: 10,
  IX: 9,
  V: 5,
  IV: 4,
  I: 1,
};
const ROMAN_KEYS = Object.keys(ROMAN) as (keyof typeof ROMAN)[];

export function numberToRomanNumeral(value: number) {
  let string = '';

  ROMAN_KEYS.forEach((index) => {
    const part = Math.floor(value / ROMAN[index]);
    value -= part * ROMAN[index];
    string += index.repeat(part);
  });

  return string;
}
