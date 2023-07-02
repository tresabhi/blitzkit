import { DefaultTheme, defineConfig } from 'vitepress';
import { getSidebar } from 'vitepress-plugin-auto-sidebar';

export default defineConfig({
  title: 'blitzkrieg',
  description: '🎉 All-in-one Discord bot for everything World of Tanks Blitz',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' },
    ],

    sidebar: getSidebar({
      collapsed: false,
      contentDirs: ['guide', 'legal', 'changelogs'],
      contentRoot: '/docs/',
    }) as DefaultTheme.Sidebar,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
    ],
  },
});
