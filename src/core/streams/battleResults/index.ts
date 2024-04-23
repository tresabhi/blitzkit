import { Parser } from 'pickleparser';
import { ReadStream } from '../buffer';

export class BattleResultsReadStream extends ReadStream {
  battleResults() {
    const pickleParser = new Parser();
    const unpickled = pickleParser.parse(new Uint8Array(this.buffer));
    const [, battleResultsString] = unpickled as [number, string];
  }
}
