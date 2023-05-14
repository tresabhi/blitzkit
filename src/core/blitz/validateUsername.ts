import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { BLITZ_SERVERS, BlitzServer } from '../../constants/servers.js';
import { AccountInfo } from '../../types/accountInfo.js';
import { Account, AccountList } from '../../types/players.js';
import errorEmbed from '../interaction/errorEmbed.js';
import { args } from '../process/args.js';
import getWargamingResponse from './getWargamingResponse.js';

export default async function validateUsername(
  interaction: ChatInputCommandInteraction<CacheType>,
  username: string,
  server: BlitzServer,
) {
  const serverName = BLITZ_SERVERS[server];

  if (Number.isNaN(Number(username))) {
    // string like "tresabhi"
    const accountList = await getWargamingResponse<AccountList>(
      `https://api.wotblitz.${server}/wotb/account/list/?application_id=${args['wargaming-application-id']}&limit=1&search=${username}`,
    );

    if (
      accountList?.[0]?.nickname.toLowerCase().trim() ===
      username.toLowerCase().trim()
    ) {
      return accountList[0];
    }

    await interaction.editReply({
      embeds: [
        errorEmbed(
          'Could not find user',
          `I couldn't find user "${username}" in the ${serverName} server. Did you select a username from the search result?`,
        ),
      ],
    });

    return null;
  } else {
    // number like 1041988373
    const accountInfo = await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${server}/wotb/account/info/?application_id=${args['wargaming-application-id']}&account_id=${username}`,
    );

    if (accountInfo) {
      const account = accountInfo[username as unknown as number];

      return {
        account_id: account.account_id,
        nickname: account.nickname,
      } satisfies Account;
    }

    await interaction.editReply({
      embeds: [
        errorEmbed(
          'Could not find user',
          `I couldn't find the user by id \`${username}\` in the ${serverName} server. Did you select a username from the search result?`,
        ),
      ],
    });

    return null;
  }
}
