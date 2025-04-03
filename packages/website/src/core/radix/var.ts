import * as ColorsRaw from '@radix-ui/colors';

type ExcludeSuffix<T> =
  T extends `${string}${'A' | `${'P3' | 'Dark'}${'' | 'A'}`}` ? never : T;
type RadixColor = ExcludeSuffix<keyof typeof ColorsRaw>;

export type VarName =
  | `color-${'background' | `panel-${'solid' | 'translucent'}` | 'surface' | 'overlay'}`
  | `radius-${1 | 2 | 3 | 4 | 5 | 6 | 'full'}`
  | `space-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`
  | `shadow-${1 | 2 | 3 | 4 | 5 | 6}`
  | `${RadixColor | 'accent' | 'gray' | 'black' | 'white'}-${
      | `${'' | 'a'}${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`
      | 'surface'
      | 'indicator'
      | 'track'
      | 'contrast'}`;

export function Var(name: VarName) {
  return `var(--${name})`;
}
