export function compareUint8Arrays(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;

  for (let index = 0; index < a.length; index++) {
    if (a[index] !== b[index]) return false;
  }

  return true;
}
