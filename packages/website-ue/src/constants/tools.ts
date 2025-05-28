import type { ButtonProps } from '@radix-ui/themes';

interface Tool {
  id: string;
  enabled: boolean;
  strings?: string;
  significant?: boolean;
  button: { color: ButtonProps['color']; contrast?: boolean };
}

export const tanks: Tool = {
  id: 'tanks',
  enabled: true,
  strings: 'tankopedia',
  significant: true,
  button: { color: 'purple' },
};

export const compare: Tool = {
  id: 'compare',
  enabled: true,
  button: { color: 'crimson' },
};

export const performance: Tool = {
  id: 'performance',
  enabled: true,
  button: { color: 'jade' },
};

export const guess: Tool = {
  id: 'guess',
  enabled: false,
  button: { color: 'bronze' },
};

export const charts: Tool = {
  id: 'charts',
  enabled: false,
  button: { color: 'bronze' },
};

export const gallery: Tool = {
  id: 'gallery',
  enabled: true,
  button: { color: 'gold' },
};

export const session: Tool = {
  id: 'session',
  enabled: true,
  button: { color: 'blue' },
};

export const tierList: Tool = {
  id: 'tier-list',
  enabled: true,
  strings: 'tier_list',
  button: { color: 'orange' },
};

export const embed: Tool = {
  id: 'embed',
  enabled: true,
  button: { color: 'cyan' },
};

export const rating: Tool = {
  id: 'rating',
  enabled: false,
  button: { color: 'orange' },
};

export const tools: Tool[] = [
  tanks,
  compare,
  performance,
  guess,
  charts,
  gallery,
  session,
  tierList,
  embed,
  rating,
];
