import { Button } from '@radix-ui/themes';
import { ComponentProps } from 'react';

export interface Tool {
  id: string;
  image: string;
  title: string;
  description: string;
  disabled?: boolean;
  href?: string;
  pageDescription?: string;
  button: {
    text: string;
    color: ComponentProps<typeof Button>['color'];
  };
  significant?: boolean;
}

export const tankopediaTool: Tool = {
  id: 'tankopedia',
  title: 'Tankopedia',
  description: 'Blitz tank encyclopedia',
  pageDescription:
    'Statistics, armor, and more for all tanks in World of Tanks Blitz',
  image: 'D8j6GZx',
  button: {
    text: 'Find your tank',
    color: 'purple',
  },
  significant: true,
};

export const ratingTool: Tool = {
  id: 'rating',
  title: 'Rating',
  description: 'Full rating leaderboard',
  pageDescription:
    'Live and archived full rating leaderboard for World of Tanks Blitz',
  image: 'WEyMZH3',
  button: {
    text: 'View leaderboard',
    color: 'orange',
  },
};

export const compareTool: Tool = {
  id: 'compare',
  title: 'Compare',
  description: 'Compare tank statistics',
  pageDescription:
    'Compare tanks statistics and loadouts in World of Tanks Blitz',
  image: 'O6VNl6e',
  button: {
    text: 'Compare tanks',
    color: 'crimson',
  },
};

export const sessionTool: Tool = {
  // TODO: rename to tracker
  id: 'session',
  title: 'Session',
  description: 'Live session stats',
  pageDescription:
    'Track your stats in real time as you play World of Tanks Blitz',
  image: 'HdG9sTf',
  button: {
    text: 'Start tracking',
    color: 'blue',
  },
};

export const discordTool: Tool = {
  id: 'discord',
  title: 'Discord bot',
  description: 'Stats right in Discord',
  href: 'https://discord.com/application-directory/1097673957865443370',
  image: '0bWE5hC',
  button: {
    text: 'Install now',
    color: 'indigo',
  },
};

export const moreTool: Tool = {
  id: 'more',
  title: 'More coming soon',
  description: "What we're making",
  href: 'https://discord.gg/nDt7AjGJQH',
  image: '1nPm6VI',
  button: {
    text: 'Join Discord',
    color: 'indigo',
  },
};

export const playerStatsTool: Tool = {
  id: 'player-stats',
  title: 'Player stats',
  description: 'Periodical player statistics',
  pageDescription: 'Periodical player statistics in World of Tanks Blitz',
  button: {
    text: 'Lookup player',
    color: 'blue',
  },
  image: 'YelSOfT',
};

export const TOOLS: Tool[] = [
  tankopediaTool,
  ratingTool,
  compareTool,
  playerStatsTool,
  sessionTool,
  discordTool,
  moreTool,
];
