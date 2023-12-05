import { crc32 } from 'crc';
import { readFile } from 'fs/promises';
import { decodeBlock } from 'lz4';

/**
 * Thanks Maddoxkkm! Modernized heavily.
 *
 * https://github.com/Maddoxkkm/dvpl_converter/
 */
export async function readDVPL(file: string) {
  const buffer = await readFile(file);
  const footerBuffer = buffer.slice(buffer.length - 20, buffer.length);

  if (
    footerBuffer.toString('utf8', 16, 20) !== 'DVPL' ||
    footerBuffer.length !== 20
  ) {
    throw 'InvalidDVPLFooter';
  }

  const footerData = {
    oSize: footerBuffer.readUInt32LE(0),
    cSize: footerBuffer.readUInt32LE(4),
    crc32: footerBuffer.readUInt32LE(8),
    type: footerBuffer.readUInt32LE(12),
  };
  const targetBlock = buffer.slice(0, buffer.length - 20);

  if (targetBlock.length !== footerData.cSize) throw 'DVPLSizeMismatch';
  if (crc32(targetBlock) !== footerData.crc32) throw 'DVPLCRC32Mismatch';
  if (footerData.type === 0) {
    if (!(footerData.oSize === footerData.cSize && footerData.type === 0)) {
      throw 'DVPLTypeSizeMismatch';
    }

    return targetBlock;
  } else if (footerData.type === 1 || footerData.type === 2) {
    const deDVPLBlock = Buffer.alloc(footerData.oSize);
    const DecompressedBlockSize = decodeBlock(targetBlock, deDVPLBlock);

    if (DecompressedBlockSize !== footerData.oSize) {
      throw 'DVPLDecodeSizeMismatch';
    }

    return deDVPLBlock;
  } else {
    throw new TypeError('Unknown DVPL format');
  }
}
