import {
  ActionRowBuilder,
  ButtonBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import * as Breakdown from '../components/Breakdown/index.js';
import NoData, { NoDataType } from '../components/NoData.js';
import PoweredByBlitzStars from '../components/PoweredByBlitzStars.js';
import TitleBar from '../components/TitleBar.js';
import Wrapper from '../components/Wrapper.js';
import { BLITZ_SERVERS } from '../constants/servers.js';
import usernameAutocomplete from '../core/autocomplete/username.js';
import getBlitzAccount from '../core/blitz/getBlitzAccount.js';
import getTankStats from '../core/blitz/getTankStats.js';
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
import { supportBlitzStars } from '../core/interaction/supportBlitzStars.js';
import addUsernameOption from '../core/options/addUsernameOption.js';
import { wargamingApplicationId } from '../core/process/args.js';
import render from '../core/ui/render.js';
import { CommandRegistry } from '../events/interactionCreate.js';
import { AccountInfo, AllStats } from '../types/accountInfo.js';
import { PlayerClanData } from '../types/playerClanData.js';

export default {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName(cmdName('today'))
    .setDescription('A general daily breakdown of your performance')
    .addStringOption(addUsernameOption),

  async execute(interaction) {
    const { id, server } = await getBlitzAccount(interaction);
    const tankStatsOverTime = await getTankStatsOverTime(
      interaction,
      server,
      id,
      last5AM().getTime() / 1000,
      new Date().getTime() / 1000,
    );
    const accountInfo = await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${server}/wotb/account/info/?application_id=${wargamingApplicationId}&account_id=${id}`,
    );
    const clanData = await getWargamingResponse<PlayerClanData>(
      `https://api.wotblitz.${server}/wotb/clans/accountinfo/?application_id=${wargamingApplicationId}&account_id=${id}&extra=clan`,
    );
    const careerTankStatsRaw = await getTankStats(interaction, server, id);
    const careerStats: Record<number, AllStats> = {
      0: accountInfo[id].statistics.all,
    };
    const allStatsToAccumulate: AllStats[] = [];

    Object.entries(tankStatsOverTime).forEach(([, tankStats]) => {
      allStatsToAccumulate.push(tankStats);
    });
    Object.entries(careerTankStatsRaw).forEach(([, tankStats]) => {
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

        return tankId === 0 || tankAverages[tankId] === undefined
          ? accumulator
          : {
              ...accumulator,
              [tankId]: getWN8(tankAverages[tankId].all, tankStats),
            };
      },
      {},
    );
    const careerWN8s = careerTankStatsRaw.reduce<Record<number, number>>(
      (accumulator, { tank_id }) => {
        return tank_id === 0 || tankAverages[tank_id] === undefined
          ? accumulator
          : {
              ...accumulator,
              [tank_id]: getWN8(
                tankAverages[tank_id].all,
                careerStats[tank_id],
              ),
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
        (accumulator, [tankIdString, WN8]) =>
          isNaN(WN8)
            ? accumulator
            : accumulator + WN8 * careerStats[Number(tankIdString)].battles,
        0,
      ) /
      careerWN8sEntries.reduce(
        (accumulator, [tankIdString, WN8]) =>
          isNaN(WN8)
            ? accumulator
            : accumulator + careerStats[Number(tankIdString)].battles,
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
          WN8={isNaN(todayWN8s[tankId]) ? undefined : todayWN8s[tankId]}
          careerWN8={isNaN(careerWN8s[tankId]) ? undefined : careerWN8s[tankId]}
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

        {rows.length === 0 && <NoData type={NoDataType.BattlesInPeriod} />}
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
  },

  autocomplete: usernameAutocomplete,
} satisfies CommandRegistry;
