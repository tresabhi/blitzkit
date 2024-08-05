export enum EmbedConfigType {
  Number,
  Radius,
  Size,
}

export type EmbedConfig = Record<string, EmbedConfigItem>;

export type EmbedConfigItem =
  | {
      type: EmbedConfigType.Number;
      default: number;
      unit?: string;
    }
  | {
      type: EmbedConfigType.Radius;
      default: RadixRadius;
    }
  | {
      type: EmbedConfigType.Size;
      default: RadixSize;
    };

export type RadixRadius = `${1 | 2 | 3 | 4}` | 'full';
export type RadixSize = `${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`;

export type ExtractEmbedConfigType<Config extends EmbedConfig> = {
  [Key in keyof Config]: ({
    type: Config[Key]['type'];
  } & EmbedConfigItem)['default'];
};
