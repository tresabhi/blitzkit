/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://blitz-krieg.vercel.app',
  generateRobotsTxt: true,
  sourceDir: 'dist/website',
};
