import { Button } from '@radix-ui/themes';
import type { ComponentProps } from 'react';

export interface Tool {
  id: string;
  stringsId?: string;
  image: string;
  disabled?: boolean;
  href?: string;
  button: {
    highContrast?: boolean;
    color: ComponentProps<typeof Button>['color'];
  };
  significant?: boolean;
  branches?: string[];
}

export const tankopediaTool: Tool = {
  id: 'tankopedia',
  image: 'D8j6GZx',
  button: {
    color: 'purple',
  },
  significant: true,
  branches: ['main', 'dev', 'opentest', 'preview'],
};

// export const ratingTool: Tool = {
//   id: 'rating',
//   image: 'WEyMZH3',
//   button: {
//     color: 'orange',
//   },
//   branches: ['main', 'dev'],
// };

export const compareTool: Tool = {
  id: 'compare',
  image: 'O6VNl6e',
  button: {
    color: 'crimson',
  },
  branches: ['main', 'dev', 'opentest', 'preview'],
};

export const sessionTool: Tool = {
  // TODO: rename to tracker
  id: 'session',
  image: 'HdG9sTf',
  button: {
    color: 'blue',
  },
  branches: ['main', 'dev'],
};

export const discordTool: Tool = {
  id: 'discord',
  href: 'https://discord.com/application-directory/1097673957865443370',
  image: '0bWE5hC',
  button: {
    color: 'indigo',
  },
};

export const moreTool: Tool = {
  id: 'more',
  href: 'https://discord.gg/nDt7AjGJQH',
  image: '1nPm6VI',
  button: {
    color: 'plum',
  },
};

export const playersTool: Tool = {
  id: 'players',
  button: {
    color: 'blue',
  },
  image: 'YelSOfT',
  href: '_', // TODO: remove this to re-enable link
  branches: ['main', 'dev'],
};

export const performanceTool: Tool = {
  id: 'performance',
  button: {
    color: 'jade',
  },
  image: 'vOKFB03',
  branches: ['main', 'dev'],
};

export const embedTool: Tool = {
  id: 'embed',
  button: {
    color: 'red',
  },
  image: 'Q0faRYg',
  branches: ['main', 'dev'],
};

export const homeTool: Tool = {
  id: 'home',
  button: { color: 'blue' },
  image: 'rUPie9G',
};

export const galleryTool: Tool = {
  id: 'gallery',
  button: {
    color: 'gold',
  },
  image: 'VhKlknk',
  branches: ['main', 'dev'],
};

export const tierListTool: Tool = {
  id: 'tier-list',
  stringsId: 'tier_list',
  button: {
    color: 'orange',
  },
  image: 'oKKc8Xv',
  branches: ['main', 'dev', 'opentest', 'preview'],
};

export const chartsTool: Tool = {
  id: 'charts',
  button: {
    color: 'bronze',
  },
  image: '6fhkljA',
  branches: ['main', 'dev', 'opentest', 'preview'],
};

export const TOOLS: Tool[] = [
  tankopediaTool,
  compareTool,
  performanceTool,
  // chartsTool,
  galleryTool,
  sessionTool,
  tierListTool,
  embedTool,
  // ratingTool,
];
