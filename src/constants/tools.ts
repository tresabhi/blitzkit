interface Tool {
  id: string;
  title: string;
  description: string;
  disabled?: boolean;
  href?: string;
}

export const TOOLS: Tool[] = [
  {
    id: 'session',
    title: 'Session tracker',
    description: 'Live session performance tracker',
  },
  {
    id: 'tankopedia',
    title: 'Tankopedia',
    description: 'Blitz tank encyclopedia',
  },
  {
    id: 'rating',
    title: 'Rating leaderboard',
    description: 'Full rating gamemode leaderboard',
  },
  {
    id: 'discord',
    title: 'Discord bot',
    description: 'Stats and tools right in Discord',
    href: 'https://discord.com/application-directory/1097673957865443370',
  },
  // {
  //   id: 'inactive',
  //   title: 'Inactivity tracker',
  //   description: 'Find inactive members of a clan',
  //   disabled: true,
  // },
  // {
  //   id: 'profile',
  //   title: 'Player profile',
  //   description: "A player's basic non-statistical info",
  //   disabled: true,
  // },
  {
    id: 'more',
    title: 'More coming soon',
    description: 'This site is being actively developed',
    href: 'https://discord.gg/nDt7AjGJQH',
  },
];
