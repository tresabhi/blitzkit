/**
 * Thank you, Rene Pot!
 *
 * https://stackoverflow.com/a/9083076/12294756
 */
export function romanize(num: number) {
  if (isNaN(num)) return NaN;
  var digits = String(+num).split(''),
    key = [
      '',
      'C',
      'CC',
      'CCC',
      'CD',
      'D',
      'DC',
      'DCC',
      'DCCC',
      'CM',
      '',
      'X',
      'XX',
      'XXX',
      'XL',
      'L',
      'LX',
      'LXX',
      'LXXX',
      'XC',
      '',
      'I',
      'II',
      'III',
      'IV',
      'V',
      'VI',
      'VII',
      'VIII',
      'IX',
    ],
    roman = '',
    i = 3;
  while (i--) roman = (key[+digits.pop()! + i * 10] || '') + roman;
  return Array(+digits.join('') + 1).join('M') + roman;
}
