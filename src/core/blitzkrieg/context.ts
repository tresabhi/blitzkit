type Context = 'website' | 'bot';

export const context: Context =
  typeof window === 'undefined' ? 'bot' : 'website';
