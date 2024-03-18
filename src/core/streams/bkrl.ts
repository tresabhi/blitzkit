import { times } from 'lodash';
import { ReadStream, WriteStream } from './buffer';

enum Format {
  Minimal,
  Comprehensive1,
}

interface BkrlMinimalEntry {
  id: number;
  score: number;
}

interface BkrlComprehensive1Entry {
  id: number;
  score: number;

  battles: number;
  wins: number;
  survived: number;

  damageDealt: number;
  damageReceived: number;

  shots: number;
  hits: number;

  kills: number;
}

type DiscriminatedEntries =
  | {
      format: Format.Minimal;
      entries: BkrlMinimalEntry[];
    }
  | {
      format: Format.Comprehensive1;
      entries: BkrlComprehensive1Entry[];
    };

export class BkrlReadStream extends ReadStream {
  bkrl() {
    this.magic();
    const header = this.header();
    return this.body(header);
  }

  body(header: ReturnType<typeof this.header>): DiscriminatedEntries {
    switch (header.format) {
      case Format.Minimal: {
        return {
          format: Format.Minimal,
          entries: times(
            header.count,
            () =>
              ({
                id: this.uint32(),
                score: this.uint16(),
              }) satisfies BkrlMinimalEntry,
          ),
        };
      }

      case Format.Comprehensive1: {
        return {
          format: Format.Comprehensive1,
          entries: times(
            header.count,
            () =>
              ({
                id: this.uint32(),
                score: this.uint16(),

                battles: this.uint32(),
                wins: this.uint32(),
                survived: this.uint32(),

                damageDealt: this.uint32(),
                damageReceived: this.uint32(),

                shots: this.uint32(),
                hits: this.uint32(),

                kills: this.uint32(),
              }) satisfies BkrlComprehensive1Entry,
          ),
        };
      }
    }
  }

  header() {
    return {
      version: this.uint16(),
      format: this.uint8() as Format,
      count: this.uint32(),
    };
  }

  magic() {
    const magic = this.utf8(4);

    if (magic !== 'BKRL') {
      throw new Error(`Invalid BKRL magic number: "${magic}"`);
    }
  }
}

export class BkrlWriteStream extends WriteStream {
  bkrl(discriminatedEntries: DiscriminatedEntries) {
    this.magic();
    this.header(discriminatedEntries);
    this.body(discriminatedEntries);
  }

  body(discriminatedEntries: DiscriminatedEntries) {
    switch (discriminatedEntries.format) {
      case Format.Minimal: {
        discriminatedEntries.entries.forEach((entry) => {
          this.uint32(entry.id);
          this.uint16(entry.score);
        });
        break;
      }

      case Format.Comprehensive1: {
        discriminatedEntries.entries.forEach((entry) => {
          this.uint32(entry.id);
          this.uint16(entry.score);

          this.uint32(entry.battles);
          this.uint32(entry.wins);
          this.uint32(entry.survived);

          this.uint32(entry.damageDealt);
          this.uint32(entry.damageReceived);

          this.uint32(entry.shots);
          this.uint32(entry.hits);

          this.uint32(entry.kills);
        });
        break;
      }
    }
  }

  header(discriminatedEntries: DiscriminatedEntries) {
    this.uint16(1);
    this.uint8(discriminatedEntries.format);
    this.uint32(discriminatedEntries.entries.length);
  }

  magic() {
    this.utf8('BKRL');
  }
}
