type Context = 'website' | 'server';

export const context: Context =
  typeof window === 'undefined' ? 'server' : 'website';
