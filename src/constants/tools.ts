interface Tool {
  id: string;
  title: string;
  description: string;
  disabled?: boolean;
}

export const TOOLS: Tool[] = [
  {
    id: 'session',
    title: 'Session tracker',
    description: 'Live session performance tracker',
  },
  {
    id: 'ratings',
    title: 'Ratings',
    description: 'Ratings gamemode leaderboards',
  },
  {
    id: 'tankopedia',
    title: 'Tankopedia',
    description: 'Blitz tank encyclopedia',
  },
  {
    id: 'inactive',
    title: 'Inactivity tracker',
    description: 'Find inactive members of a clan',
    disabled: true,
  },
  {
    id: 'profile',
    title: 'Player profile',
    description: "A player's basic non-statistical info",
    disabled: true,
  },
  // {
  //   title: 'More coming soon',
  //   description: 'New tools are added often',
  //   banner: '/assets/banners/more.png',
  //   id: 'https://discord.gg/nDt7AjGJQH',
  // },
];
