import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import {
  BLITZ_SERVERS_SHORT,
  BLITZ_SERVERS_SHORT_INVERSE,
  BlitzServer,
} from '../constants/servers.js';
import { badNicknameFormat } from '../embeds/badNicknameFormat.js';
import { noMember } from '../embeds/noMember.js';
import errorEmbed from './errorEmbed.js';

const nicknamePattern = /(.+) \((.+)\)/;

const VALID_BLITZ_SERVERS_SHORT = Object.keys(BLITZ_SERVERS_SHORT_INVERSE);

export default async function extractUser(
  interaction: ChatInputCommandInteraction<CacheType>,
) {
  if (!interaction.member) {
    await interaction.editReply({ embeds: [noMember] });
    return;
  }

  const member = interaction.guild?.members.cache.get(
    interaction.member.user.id,
  );
  const nickname = member?.nickname ?? member?.user.username;
  if (!nickname) {
    await interaction.editReply({ embeds: [noMember] });
    return;
  }

  const matches = nickname.match(nicknamePattern);
  if (!matches) {
    await interaction.editReply({ embeds: [badNicknameFormat] });
    return;
  }

  const [, nameMatch, serverMatch] = matches;
  const nameArg = interaction.options.getString('name');
  const serverArg = interaction.options.getString(
    'server',
  ) as BlitzServer | null;
  const name = nameArg ?? nameMatch;
  const server =
    BLITZ_SERVERS_SHORT[serverArg as keyof typeof BLITZ_SERVERS_SHORT] ??
    serverMatch;

  if (!VALID_BLITZ_SERVERS_SHORT.includes(server)) {
    await interaction.editReply({
      embeds: [
        errorEmbed(
          'Invalid server',
          `"${server}" is not a valid server. Use the \`/verify\` command to setup your nickname correctly or manually provide me with the server in the command.`,
        ),
      ],
    });
    return;
  }

  return {
    name,
    server: BLITZ_SERVERS_SHORT_INVERSE[
      server as keyof typeof BLITZ_SERVERS_SHORT_INVERSE
    ] as BlitzServer,
  };
}
