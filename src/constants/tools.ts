interface Tool {
  id: string;
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
  // },
  {
    id: 'tankopedia',
    title: 'Tankopedia',
    description: 'Blitz tank encyclopedia',
    pageDescription:
      'Statistics, armor, and more for all tanks in World of Tanks Blitz',
  },
  {
    id: 'rating',
    title: 'Rating',
    description: 'Full rating gamemode leaderboard',
    pageDescription:
      'Live and archived full rating leaderboard for World of Tanks Blitz',
  },
  {
    id: 'compare',
    title: 'Compare',
    description: 'Compare tank statistics and loadouts',
    pageDescription:
      'Compare tanks statistics and loadouts in World of Tanks Blitz',
  },
  {
    id: 'session',
    title: 'Session tracker',
    description: 'Live session performance tracker',
    pageDescription:
      'Track your stats in real time as you play World of Tanks Blitz',
  },
  {
    id: 'discord',
    title: 'Discord bot',
    description: 'Stats and tools right in Discord',
    href: 'https://discord.com/application-directory/1097673957865443370',
  },
  {
    id: 'more',
    title: 'More coming soon',
    description: 'This site is being actively developed',
    href: 'https://discord.gg/nDt7AjGJQH',
  },
];
