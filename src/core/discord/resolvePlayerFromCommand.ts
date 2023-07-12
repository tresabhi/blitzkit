import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { BlitzServer } from '../../constants/servers';
import listPlayers, {
  usernamePatternWithoutPosition,
} from '../blitz/listPlayers';
import throwError from '../node/throwError';

export const serverAndIdPattern = /(com|eu|asia)\/[0-9]+/;

export interface ResolvedPlayer {
  server: BlitzServer;
  id: number;
}

export default async function resolvePlayerFromCommand(
  interaction: ChatInputCommandInteraction<CacheType>,
) {
  const commandUsername = interaction.options.getString('username');
  const displayName = interaction.guild?.members.cache
    .get(interaction.user.id)
    ?.displayName.match(usernamePatternWithoutPosition)?.[0];
  const username = commandUsername ?? displayName;

  if (username === undefined) {
    throw throwError(
      'Username could not be inferred',
      "You didn't provide me a username in the command nor was I able to infer your Blitz username from your Discord nickname. Try providing a username manually in the command or using the `/verify` command to set your Discord nickname to your Blitz username.",
    );
  }

  if (serverAndIdPattern.test(username)) {
    const [server, accountId] = username.split('/');
    return {
      server: server as BlitzServer,
      id: Number(accountId),
    } satisfies ResolvedPlayer;
  } else {
    const accounts = await listPlayers(username);

    if (accounts[0]) {
      return {
        server: accounts[0].server,
        id: accounts[0].account_id,
      } satisfies ResolvedPlayer;
    } else {
      throw throwError(
        'Could not find user',
        `I couldn't find user \`${username}\`. Try providing a valid username manually or using the \`/verify\` command to set your Discord nickname to your Blitz username.`,
      );
    }
  }
}
