interface Tool {
  id: string;
  image: string;
  title: string;
  description: string;
  disabled?: boolean;
  href?: string;
  pageDescription?: string;
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
  },
  {
    id: 'rating',
    title: 'Rating',
    description: 'Full rating gamemode leaderboard',
    pageDescription:
      'Live and archived full rating leaderboard for World of Tanks Blitz',
    image: 'WEyMZH3',
  },
  {
    id: 'compare',
    title: 'Compare',
    description: 'Compare tank statistics and loadouts',
    pageDescription:
      'Compare tanks statistics and loadouts in World of Tanks Blitz',
    image: 'O6VNl6e',
  },
  {
    // TODO: rename to tracker
    id: 'session',
    title: 'Session',
    description: 'Live session performance tracker',
    pageDescription:
      'Track your stats in real time as you play World of Tanks Blitz',
    image: 'HdG9sTf',
  },
  {
    id: 'discord',
    title: 'Discord bot',
    description: 'Stats and tools right in Discord',
    href: 'https://discord.com/application-directory/1097673957865443370',
    image: '0bWE5hC',
  },
  {
    id: 'more',
    title: 'More coming soon',
    description: 'This site is being actively developed',
    href: 'https://discord.gg/nDt7AjGJQH',
    image: '1nPm6VI',
  },
];
