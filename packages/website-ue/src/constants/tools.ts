import type { ButtonProps } from '@radix-ui/themes';

export interface Tool {
  id: string;
  enabled?: boolean;
  strings?: string;
  significant?: boolean;
  button: { color: ButtonProps['color']; contrast?: boolean };
}

export const tanksTool: Tool = {
  id: 'tanks',
  strings: 'tankopedia',
  significant: true,
  button: { color: 'purple' },
};

export const compareTool: Tool = {
  id: 'compare',
  button: { color: 'crimson' },
};

export const performanceTool: Tool = {
  id: 'performance',
  button: { color: 'jade' },
};

export const guessTool: Tool = {
  id: 'guess',
  button: { color: 'bronze' },
};

export const chartsTool: Tool = {
  id: 'charts',
  button: { color: 'bronze' },
};

export const avatarsTool: Tool = {
  id: 'avatars',
  enabled: true,
  significant: true,
  button: { color: 'gold' },
};

export const sessionTool: Tool = {
  id: 'session',
  button: { color: 'blue' },
};

export const tierListTool: Tool = {
  id: 'tier-list',
  strings: 'tier_list',
  button: { color: 'orange' },
};

export const embedTool: Tool = {
  id: 'embed',
  button: { color: 'cyan' },
};

export const ratingTool: Tool = {
  id: 'rating',
  button: { color: 'orange' },
};

export const tools: Tool[] = [
  tanksTool,
  compareTool,
  performanceTool,
  guessTool,
  chartsTool,
  avatarsTool,
  sessionTool,
  tierListTool,
  embedTool,
  ratingTool,
];
