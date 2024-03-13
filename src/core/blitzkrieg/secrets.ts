import { config } from 'dotenv';

config();

const SECRET_KEYS = [
  'DISCORD_TOKEN',
  'GH_TOKEN',
  'DISCORD_BLITZ_DB',
  'WOTB_DLC_CDN',
] as const;

export type SECRET = typeof SECRET_KEYS extends readonly (infer T)[]
  ? T
  : never;

export const secrets = SECRET_KEYS.reduce<Partial<Record<SECRET, string>>>(
  (accumulator, key) => ({
    ...accumulator,

    get [key](): string {
      if (!(key in process.env)) throw new Error(`Secret ${key} not provided`);
      return process.env[key]!;
    },
  }),
  {},
) as Record<SECRET, string>;
