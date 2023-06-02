import {
  ActionRowBuilder,
  ButtonBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import * as Breakdown from '../components/Breakdown/index.js';
import NoBattlesInPeriod from '../components/NoBattlesInPeriod.js';
import PoweredByBlitzStars from '../components/PoweredByBlitzStars.js';
import TitleBar from '../components/TitleBar.js';
import Wrapper, { WrapperSize } from '../components/Wrapper.js';
import { BLITZ_SERVERS } from '../constants/servers.js';
import usernameAutocomplete from '../core/autocomplete/username.js';
import getBlitzAccount from '../core/blitz/getBlitzAccount.js';
import getWN8 from '../core/blitz/getWN8.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import resolveTankName from '../core/blitz/resolveTankName.js';
import sumStats from '../core/blitz/sumStats.js';
import { tankopedia } from '../core/blitz/tankopedia.js';
import getTankStatsOverTime from '../core/blitzstars/getTankStatsOverTime.js';
import last5AM from '../core/blitzstars/last5AM.js';
import { tankAverages } from '../core/blitzstars/tankAverages.js';
import cmdName from '../core/interaction/cmdName.js';
import fullBlitzStarsStats from '../core/interaction/fullBlitzStarsStats.js';
import infoEmbed from '../core/interaction/infoEmbed.js';
import { supportBlitzStars } from '../core/interaction/supportBlitzStars.js';
import addUsernameOption from '../core/options/addUsernameOption.js';
import { args } from '../core/process/args.js';
import render from '../core/ui/render.js';
import { CommandRegistry } from '../events/interactionCreate.js';
import { AccountInfo, AllStats } from '../types/accountInfo.js';
import { PlayerClanData } from '../types/playerClanData.js';
import { TanksStats } from '../types/tanksStats.js';

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
    const careerStats: Record<number, AllStats> = {
      0: accountInfo[id].statistics.all,
    };
    const allStatsToAccumulate: AllStats[] = [];

    Object.entries(tankStatsOverTime).forEach(([, tankStats]) => {
      allStatsToAccumulate.push(tankStats);
    });
    Object.entries(careerTankStatsRaw[id]).forEach(([, tankStats]) => {
      careerStats[tankStats.tank_id] = tankStats.all;
    });

    const accumulatedStats = sumStats(allStatsToAccumulate);

    if (Object.keys(tankStatsOverTime).length > 0) {
      tankStatsOverTime[0] = accumulatedStats;
    }

    const tankStatsOverTimeEntries = Object.entries(tankStatsOverTime);
    const todayWN8s = tankStatsOverTimeEntries.reduce<Record<number, number>>(
      (accumulator, [tankIdString, tankStats]) => {
        const tankId = Number(tankIdString);

        return tankId === 0
          ? accumulator
          : {
              ...accumulator,
              [tankId]: getWN8(tankAverages[tankId].all, tankStats),
            };
      },
      {},
    );
    const careerWN8s = tankStatsOverTimeEntries.reduce<Record<number, number>>(
      (accumulator, [tankIdString, tankStats]) => {
        const tankId = Number(tankIdString);

        return tankId === 0
          ? accumulator
          : {
              ...accumulator,
              [tankId]: getWN8(tankAverages[tankId].all, careerStats[tankId]),
            };
      },
      {},
    );
    const todayWN8sEntries = Object.entries(todayWN8s);
    const careerWN8sEntries = Object.entries(careerWN8s);

    todayWN8s[0] =
      todayWN8sEntries.reduce(
        (accumulator, [tankIdString, wn8]) =>
          accumulator + wn8 * tankStatsOverTime[Number(tankIdString)].battles,
        0,
      ) /
      todayWN8sEntries.reduce(
        (accumulator, [tankIdString]) =>
          accumulator + tankStatsOverTime[Number(tankIdString)].battles,
        0,
      );
    careerWN8s[0] =
      careerWN8sEntries.reduce(
        (accumulator, [tankIdString, wn8]) =>
          accumulator + wn8 * careerStats[Number(tankIdString)].battles,
        0,
      ) /
      careerWN8sEntries.reduce(
        (accumulator, [tankIdString]) =>
          accumulator + careerStats[Number(tankIdString)].battles,
        0,
      );

    const rows = tankStatsOverTimeEntries.map(([tankIdString, tankStats]) => {
      const tankId = Number(tankIdString);
      const career = careerStats[tankId];

      return (
        <Breakdown.Row
          key={tankId}
          name={tankId === 0 ? 'Total' : resolveTankName(Number(tankIdString))}
          winrate={tankStats.wins / tankStats.battles}
          careerWinrate={career.wins / career.battles}
          WN8={todayWN8s[tankId]}
          careerWN8={careerWN8s[tankId]}
          damage={tankStats.damage_dealt / tankStats.battles}
          careerDamage={career.damage_dealt / career.battles}
          survival={tankStats.survived_battles / tankStats.battles}
          careerSurvival={career.survived_battles / career.battles}
          battles={tankStats.battles}
          careerBattles={career.battles}
          icon={
            tankId === 0
              ? undefined
              : tankopedia[tankIdString as unknown as number].images.normal
          }
        />
      );
    });

    const image = await render(
      <Wrapper size={WrapperSize.Roomy}>
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
      WrapperSize.Roomy,
    );

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      fullBlitzStarsStats(server, accountInfo[id].nickname),
      supportBlitzStars,
    );

    await interaction.editReply({
      embeds:
        rows.length >= 6
          ? [
              infoEmbed(
                'Very large image!',
                'Zoom in or click "Open in Browser."',
              ),
            ]
          : undefined,
      files: [image],
      components: [actionRow],
    });

    console.log(`Showing daily breakdown for ${accountInfo[id].nickname}`);
  },

  autocomplete: usernameAutocomplete,
} satisfies CommandRegistry;
