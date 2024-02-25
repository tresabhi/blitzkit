declare module 'lz4js' {
  export function compress(buffer: Uint8Array, maxSize?: number): Uint8Array;
  export function decompress(buffer: Uint8Array, maxSize?: number): Uint8Array;
}
