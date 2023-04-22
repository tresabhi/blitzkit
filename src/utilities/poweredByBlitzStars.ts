import { EmbedBuilder } from 'discord.js';

export default function poweredByBlitzStars(embed: EmbedBuilder) {
  return embed.setTimestamp().setFooter({
    text: 'Powered by BlitzStars',
    iconURL: 'https://www.blitzstars.com/assets/images/TankyMcPewpew.png',
  });
}
