import { ButtonBuilder, ButtonStyle } from 'discord.js';

export const supportBlitzStars = new ButtonBuilder()
  .setLabel('Support BlitzStars')
  .setURL('https://www.blitzstars.com/supporters')
  .setStyle(ButtonStyle.Link);
