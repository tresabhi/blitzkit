import {
  ActionRowBuilder,
  ButtonBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import * as Breakdown from '../components/Breakdown/index.js';
import NoBattlesInPeriod from '../components/NoBattlesInPeriod.js';
import PoweredByBlitzStars from '../components/PoweredByBlitzStars.js';
import TitleBar from '../components/TitleBar.js';
import Wrapper from '../components/Wrapper.js';
import { BLITZ_SERVERS } from '../constants/servers.js';
import fullBlitzStarsStats from '../core/actions/fullBlitzStarsStats.js';
import { supportBlitzStars } from '../core/actions/supportBlitzStars.js';
import usernameAutocomplete from '../core/autocomplete/username.js';
import getBlitzAccount from '../core/blitz/getBlitzAccount.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import getTankStatsOverTime from '../core/blitzstars/getTankStatsOverTime.js';
import last5AM from '../core/blitzstars/last5AM.js';
import { tankopedia } from '../core/blitzstars/tankopedia.js';
import cmdName from '../core/interaction/cmdName.js';
import addUsernameOption from '../core/options/addUsernameOption.js';
import { args } from '../core/process/args.js';
import render from '../core/ui/render.js';
import { CommandRegistry } from '../events/interactionCreate.js';
import { AccountInfo, AllStats } from '../types/accountInfo.js';
import { PlayerClanData } from '../types/playerClanData.js';
import { TanksStats } from '../types/tanksStats.js';
import resolveTankName from '../utilities/resolveTankName.js';

export default {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName(cmdName('today'))
    .setDescription('A general daily breakdown of your performance')
    .addStringOption(addUsernameOption),

  async execute(interaction) {
    const username = interaction.options.getString('username')!;
    const blitzAccount = await getBlitzAccount(interaction, username);
    const { id, server } = blitzAccount;
    const tankStatsOverTime = await getTankStatsOverTime(
      server,
      id,
      last5AM().getTime() / 1000,
      new Date().getTime() / 1000,
    );
    const accountInfo = await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${server}/wotb/account/info/?application_id=${args['wargaming-application-id']}&account_id=${id}`,
    );
    const clanData = await getWargamingResponse<PlayerClanData>(
      `https://api.wotblitz.${server}/wotb/clans/accountinfo/?application_id=${args['wargaming-application-id']}&account_id=${id}&extra=clan`,
    );
    const careerTankStatsRaw = await getWargamingResponse<TanksStats>(
      `https://api.wotblitz.${server}/wotb/tanks/stats/?application_id=${args['wargaming-application-id']}&account_id=${id}`,
    );
    const careerStats: Record<number, AllStats> = {};

    Object.entries(careerTankStatsRaw[id]).forEach(([, tankStats]) => {
      careerStats[tankStats.tank_id] = tankStats.all;
    });

    const rows = Object.entries(tankStatsOverTime).map(
      ([tankId, tankStats]) => {
        const career = careerStats[tankId as unknown as number];

        return (
          <Breakdown.Row
            key={tankId}
            name={resolveTankName({
              tank_id: tankId as unknown as number,
              name: tankopedia[tankId as unknown as number].name,
            })}
            winrate={tankStats.wins / tankStats.battles}
            careerWinrate={career.wins / career.battles}
            WN8={-Infinity}
            careerWN8={-Infinity}
            damage={tankStats.damage_dealt / tankStats.battles}
            careerDamage={career.damage_dealt / career.battles}
            survival={tankStats.survived_battles / tankStats.battles}
            careerSurvival={career.survived_battles / career.battles}
            battles={tankStats.battles}
            careerBattles={career.battles}
            icon={tankopedia[tankId as unknown as number].images.normal}
          />
        );
      },
    );

    const image = await render(
      <Wrapper>
        <TitleBar
          name={accountInfo[id].nickname}
          nameDiscriminator={
            clanData[id]?.clan ? `[${clanData[id]?.clan?.tag}]` : undefined
          }
          image={
            clanData[id]?.clan
              ? `https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clanData[id]?.clan?.emblem_set_id}.png`
              : undefined
          }
          description={`Today's breakdown • ${new Date().toDateString()} • ${
            BLITZ_SERVERS[server]
          }`}
        />

        {rows.length === 0 && <NoBattlesInPeriod />}
        {rows.length > 0 && <Breakdown.Root>{rows}</Breakdown.Root>}

        <PoweredByBlitzStars />
      </Wrapper>,
    );

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      fullBlitzStarsStats(server, accountInfo[id].nickname),
      supportBlitzStars,
    );

    await interaction.editReply({
      files: [image],
      components: [actionRow],
    });

    console.log(`Showing daily breakdown for ${accountInfo[id].nickname}`);
  },

  autocomplete: usernameAutocomplete,
} satisfies CommandRegistry;
