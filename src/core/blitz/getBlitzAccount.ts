import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { BlitzServer } from '../../constants/servers.js';
import negativeEmbed from '../interaction/negativeEmbed.js';
import listAccountsPanServer, {
  usernamePatternWithoutPosition,
} from './listAccountsPanServer.js';

export const serverAndIdPattern = /(com|eu|asia)\/[0-9]+/;

export default async function getBlitzAccount(
  interaction: ChatInputCommandInteraction<CacheType>,
) {
  const commandUsername = interaction.options.getString('username');
  const displayName = interaction.guild?.members.cache
    .get(interaction.user.id)
    ?.displayName.match(usernamePatternWithoutPosition)?.[0];
  const username = commandUsername ?? displayName;

  if (username === undefined) {
    await interaction.editReply({
      embeds: [
        negativeEmbed(
          'Username could not be inferred',
          "You didn't provide me a username in the command nor was I able to infer your Blitz username from your Discord nickname. Try providing a username manually in the command or using the `/verify` command to set your Discord nickname to your Blitz username.",
        ),
      ],
    });

    throw new Error(
      `No username provided commandUsername: ${commandUsername} displayName: ${displayName} username: ${username}`,
    );
  }

  if (serverAndIdPattern.test(username)) {
    const [server, accountId] = username.split('/');
    return { server: server as BlitzServer, id: Number(accountId) };
  } else {
    const accounts = await listAccountsPanServer(username);

    if (accounts[0]) {
      return { server: accounts[0].server, id: accounts[0].account_id };
    } else {
      await interaction.editReply({
        embeds: [
          negativeEmbed(
            'Could not find user',
            `I couldn't find user \`${username}\`. Try providing a username manually or using the \`/verify\` command to set your Discord nickname to your Blitz username.`,
          ),
        ],
      });

      throw new Error(`Could not find user "${username}"`);
    }
  }
}
