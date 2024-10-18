type Name =
  | `color-${'background' | `panel-${'solid' | 'translucent'}` | 'surface' | 'overlay'}`
  | `radius-${1 | 2 | 3 | 4 | 5 | 6 | 'full'}`
  | `space-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`

export function Var(name: Name) {
  return `var(--${name})`;
}
