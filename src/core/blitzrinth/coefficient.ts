export function coefficient(...effects: [boolean, number][]) {
  return effects.reduce((accumulator, b) => accumulator + (b[0] ? b[1] : 0), 1);
}
