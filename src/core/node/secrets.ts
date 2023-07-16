const SECRET_KEYS = ['DISCORD_TOKEN', 'WARGAMING_APPLICATION_ID'] as const;

type SECRET_KEY = typeof SECRET_KEYS extends readonly (infer T)[] ? T : never;

export const secrets = SECRET_KEYS.reduce<Partial<Record<SECRET_KEY, string>>>(
  (accumulator, key) => ({
    ...accumulator,

    get [key](): string {
      if (!(key in process.env)) throw new Error(`Key ${key} not provided`);
      return process.env[key]!;
    },
  }),
  {},
) as Record<SECRET_KEY, string>;
