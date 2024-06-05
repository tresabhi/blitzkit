import { Button } from '@radix-ui/themes';
import { ComponentProps } from 'react';

interface Tool {
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

export const TOOLS: Tool[] = [
  // {
  //   id: 'statistics',
  //   title: 'Statistics',
  //   description: 'Periodical player statistics',
  //   pageDescription:
  //     'Periodical player statistics and tanks played in World of Tanks Blitz',
  //   disabled: true,
  //   image: '8gJGkKP'
  // },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
    id: 'discord',
    title: 'Discord bot',
    description: 'Stats right in Discord',
    href: 'https://discord.com/application-directory/1097673957865443370',
    image: '0bWE5hC',
    button: {
      text: 'Install now',
      color: 'indigo',
    },
  },
  {
    id: 'more',
    title: 'More coming soon',
    description: "What we're making",
    href: 'https://discord.gg/nDt7AjGJQH',
    image: '1nPm6VI',
    button: {
      text: 'Join Discord',
      color: 'indigo',
    },
  },
];
