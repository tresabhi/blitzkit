import { SlashCommandBuilder } from 'discord.js';
import GenericStats from '../components/GenericStats/index.js';
import NoData, { NoDataType } from '../components/NoData.js';
import PoweredBy, { PoweredByType } from '../components/PoweredBy.js';
import TitleBar from '../components/TitleBar.js';
import Wrapper from '../components/Wrapper.js';
import { BLITZ_SERVERS } from '../constants/servers.js';
import getBlitzClan from '../core/blitz/getBlitzClan.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import addClanChoices from '../core/discord/addClanChoices.js';
import autocompleteClan from '../core/discord/autocompleteClan.js';
import { WARGAMING_APPLICATION_ID } from '../core/node/arguments.js';
import { CommandRegistry } from '../events/interactionCreate/index.js';
import { AccountInfo } from '../types/accountInfo.js';
import { ClanInfo } from '../types/clanInfo.js';

const DEFAULT_THRESHOLD = 7;

export const inactiveCommand: CommandRegistry = {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('inactive')
    .setDescription('Lists all inactive players')
    .addStringOption(addClanChoices)
    .addNumberOption((option) =>
      option
        .setName('threshold')
        .setDescription(
          `The number of days inactive (default: ${DEFAULT_THRESHOLD})`,
        )
        .setMinValue(0),
    ),

  async handler(interaction) {
    const clanName = interaction.options.getString('clan')!;
    const { server, id } = await getBlitzClan(clanName);
    const threshold =
      interaction.options.getNumber('threshold')! ?? DEFAULT_THRESHOLD;
    const time = new Date().getTime() / 1000;
    const clanData = (
      await getWargamingResponse<ClanInfo>(
        `https://api.wotblitz.${server}/wotb/clans/info/?application_id=${WARGAMING_APPLICATION_ID}&clan_id=${id}`,
      )
    )[id];
    const memberIds = clanData.members_ids;
    const accounts = await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${server}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${memberIds.join(
        ',',
      )}`,
    );
    const inactive = memberIds
      .map((memberId) => {
        const member = accounts[memberId];
        const inactiveDays = (time - member.last_battle_time) / 60 / 60 / 24;

        return [member.nickname, inactiveDays] as [string, number];
      })
      .filter(([, inactiveDays]) => inactiveDays >= threshold)
      .sort((a, b) => b[1] - a[1])
      .map(
        ([name, days]) => [name, `${days.toFixed(0)} days`] as [string, string],
      );
    const hasInactiveMembers = inactive.length > 0;

    return (
      <Wrapper>
        <TitleBar
          name={clanData.name}
          nameDiscriminator="(Inactivity)"
          image={`https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clanData.emblem_set_id}.png`}
          description={`${threshold}+ Days • ${new Date().toDateString()} • ${
            BLITZ_SERVERS[server]
          }`}
        />

        {!hasInactiveMembers && <NoData type={NoDataType.PlayersInPeriod} />}
        {hasInactiveMembers && <GenericStats stats={inactive} />}

        <PoweredBy type={PoweredByType.Wargaming} />
      </Wrapper>
    );
  },

  autocomplete: autocompleteClan,
};
