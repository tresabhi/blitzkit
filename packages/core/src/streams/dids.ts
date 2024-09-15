import { times } from 'lodash-es';
import { ReadStream, WriteStream } from './buffer';

export class DidsReadStream extends ReadStream {
  dids() {
    this.magic();
    this.header();
    return this.body();
  }

  magic() {
    const magic = this.utf8(4);
    if (magic !== 'DIDS') {
      throw new Error(`Invalid DIDS magic number: "${magic}"`);
    }
  }

  header() {
    return {
      version: this.uint16(),
    };
  }

  body() {
    const count = this.uint32();
    return times(count, () => this.uint32());
  }
}

export class DidsWriteStream extends WriteStream {
  dids(ids: number[]) {
    this.magic();
    this.header();
    this.body(ids);

    return this;
  }

  magic() {
    this.utf8('DIDS');
  }

  header() {
    this.uint16(1);
  }

  body(ids: number[]) {
    this.uint32(ids.length);
    ids.forEach((id) => this.uint32(id));
  }
}
