import type { ButtonProps } from '@radix-ui/themes';

export interface Tool {
  id: string;
  enabled: boolean;
  strings?: string;
  significant?: boolean;
  button: { color: ButtonProps['color']; contrast?: boolean };
}

export const tanksTool: Tool = {
  id: 'tanks',
  enabled: true,
  strings: 'tankopedia',
  significant: true,
  button: { color: 'purple' },
};

export const compareTool: Tool = {
  id: 'compare',
  enabled: true,
  button: { color: 'crimson' },
};

export const performanceTool: Tool = {
  id: 'performance',
  enabled: true,
  button: { color: 'jade' },
};

export const guessTool: Tool = {
  id: 'guess',
  enabled: false,
  button: { color: 'bronze' },
};

export const chartsTool: Tool = {
  id: 'charts',
  enabled: false,
  button: { color: 'bronze' },
};

export const galleryTool: Tool = {
  id: 'gallery',
  enabled: true,
  button: { color: 'gold' },
};

export const sessionTool: Tool = {
  id: 'session',
  enabled: true,
  button: { color: 'blue' },
};

export const tierListTool: Tool = {
  id: 'tier-list',
  enabled: true,
  strings: 'tier_list',
  button: { color: 'orange' },
};

export const embedTool: Tool = {
  id: 'embed',
  enabled: true,
  button: { color: 'cyan' },
};

export const ratingTool: Tool = {
  id: 'rating',
  enabled: false,
  button: { color: 'orange' },
};

export const tools: Tool[] = [
  tanksTool,
  compareTool,
  performanceTool,
  guessTool,
  chartsTool,
  galleryTool,
  sessionTool,
  tierListTool,
  embedTool,
  ratingTool,
];
