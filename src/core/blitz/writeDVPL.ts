import { crc32 } from 'crc';
import { encodeBlockHC } from 'lz4';

/**
 * Thanks Maddoxkkm! Modernized heavily.
 *
 * https://github.com/Maddoxkkm/dvpl_converter/
 */
export function writeDVPL(buffer: Buffer) {
  let output = Buffer.alloc(buffer.length);
  const compressedBlockSize = encodeBlockHC(buffer, output);

  if (compressedBlockSize === 0 || compressedBlockSize >= buffer.length) {
    const footerBuffer = toDVPLFooter(
      buffer.length,
      buffer.length,
      crc32(buffer),
      0,
    );

    return Buffer.concat([buffer, footerBuffer], buffer.length + 20);
  } else {
    output = output.subarray(0, compressedBlockSize);
    const footerBuffer = toDVPLFooter(
      buffer.length,
      compressedBlockSize,
      crc32(output),
      2,
    );

    return Buffer.concat([output, footerBuffer], compressedBlockSize + 20);
  }
}

function toDVPLFooter(
  inputSize: number,
  compressedSize: number,
  crc32: number,
  type: number,
) {
  const result = Buffer.alloc(20);

  result.writeUInt32LE(inputSize, 0);
  result.writeUInt32LE(compressedSize, 4);
  result.writeUInt32LE(crc32, 8);
  result.writeUInt32LE(type, 12);
  result.write('DVPL', 16, 4, 'utf8');

  return result;
}
