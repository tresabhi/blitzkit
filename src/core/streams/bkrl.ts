import { times } from 'lodash';
import { ReadStream, WriteStream } from './buffer';

export enum BkrlFormat {
  Minimal,
  Superset1,
}

export interface BkrlMinimalEntry {
  id: number;
  score: number;
}

export interface BkrlSuperset1Entry {
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

export type BkrlDiscriminatedEntries =
  | {
      format: BkrlFormat.Minimal;
      entries: BkrlMinimalEntry[];
    }
  | {
      format: BkrlFormat.Superset1;
      entries: BkrlSuperset1Entry[];
    };

export class BkrlReadStream extends ReadStream {
  bkrl() {
    this.magic();
    const header = this.header();
    return this.body(header);
  }

  body(header: ReturnType<typeof this.header>): BkrlDiscriminatedEntries {
    switch (header.format) {
      case BkrlFormat.Minimal: {
        return {
          format: BkrlFormat.Minimal,
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

      case BkrlFormat.Superset1: {
        return {
          format: BkrlFormat.Superset1,
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
              }) satisfies BkrlSuperset1Entry,
          ),
        };
      }
    }
  }

  header() {
    return {
      version: this.uint16(),
      format: this.uint8() as BkrlFormat,
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
  bkrl(discriminatedEntries: BkrlDiscriminatedEntries) {
    this.magic();
    this.header(discriminatedEntries);
    this.body(discriminatedEntries);
  }

  body(discriminatedEntries: BkrlDiscriminatedEntries) {
    switch (discriminatedEntries.format) {
      case BkrlFormat.Minimal: {
        discriminatedEntries.entries.forEach((entry) => {
          this.uint32(entry.id);
          this.uint16(entry.score);
        });
        break;
      }

      case BkrlFormat.Superset1: {
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

  header(discriminatedEntries: BkrlDiscriminatedEntries) {
    this.uint16(1);
    this.uint8(discriminatedEntries.format);
    this.uint32(discriminatedEntries.entries.length);
  }

  magic() {
    this.utf8('BKRL');
  }
}
