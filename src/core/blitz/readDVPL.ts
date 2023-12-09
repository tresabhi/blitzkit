import { crc32 } from 'crc';
import { decodeBlock } from 'lz4';

/**
 * Thanks Maddoxkkm! Modernized heavily.
 *
 * https://github.com/Maddoxkkm/dvpl_converter/
 */
export function readDVPL(buffer: Buffer) {
  const footerBuffer = buffer.subarray(buffer.length - 20, buffer.length);

  if (
    footerBuffer.toString('utf8', 16, 20) !== 'DVPL' ||
    footerBuffer.length !== 20
  ) {
    throw new SyntaxError('Invalid DVPL footer');
  }

  const footerData = {
    oSize: footerBuffer.readUInt32LE(0),
    cSize: footerBuffer.readUInt32LE(4),
    crc32: footerBuffer.readUInt32LE(8),
    type: footerBuffer.readUInt32LE(12),
  };
  const targetBlock = buffer.subarray(0, buffer.length - 20);

  if (targetBlock.length !== footerData.cSize) {
    throw new RangeError('DVPL size mismatch');
  }
  if (crc32(targetBlock) !== footerData.crc32) {
    throw new TypeError('DVPL CRC32 mismatch');
  }
  if (footerData.type === 0) {
    if (!(footerData.oSize === footerData.cSize && footerData.type === 0)) {
      throw new RangeError('DVPL type and size mismatch');
    }

    return targetBlock;
  } else if (footerData.type === 1 || footerData.type === 2) {
    const deDVPLBlock = Buffer.alloc(footerData.oSize);
    const DecompressedBlockSize = decodeBlock(targetBlock, deDVPLBlock);

    if (DecompressedBlockSize !== footerData.oSize) {
      throw new RangeError('Decompressed DVPL size mismatch');
    }

    return deDVPLBlock;
  } else {
    throw new SyntaxError('Unknown DVPL format');
  }
}
