import { SlashCommandBuilder } from 'discord.js';
import GenericAllStats from '../components/GenericAllStats.js';
import NoData, { NoDataType } from '../components/NoData.js';
import PoweredByBlitzStars from '../components/PoweredByBlitzStars.js';
import TitleBar from '../components/TitleBar.js';
import Wrapper from '../components/Wrapper.js';
import { BLITZ_SERVERS } from '../constants/servers.js';
import tanksAutocomplete from '../core/autocomplete/tanks.js';
import usernameAutocomplete from '../core/autocomplete/username.js';
import getBlitzAccount from '../core/blitz/getBlitzAccount.js';
import getTankStats from '../core/blitz/getTankStats.js';
import getWN8 from '../core/blitz/getWN8.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import resolveTankId from '../core/blitz/resolveTankId.js';
import resolveTankName from '../core/blitz/resolveTankName.js';
import { tankopedia } from '../core/blitz/tankopedia.js';
import getPeriodNow from '../core/blitzstars/getPeriodNow.js';
import getPeriodicStart from '../core/blitzstars/getPeriodStart.js';
import getPeriodStartFromDaysAgo from '../core/blitzstars/getPeriodStartFromDaysAgo.js';
import getTankStatsOverTime, {
  emptyAllStats,
} from '../core/blitzstars/getTankStatsOverTime.js';
import { tankAverages } from '../core/blitzstars/tankAverages.js';
import cmdName from '../core/interaction/cmdName.js';
import fullBlitzStarsStats from '../core/interaction/fullBlitzStarsStats.js';
import { supportBlitzStars } from '../core/interaction/supportBlitzStars.js';
import addCustomPeriodOption from '../core/options/addCustomPeriodOption.js';
import addPeriodChoices, {
  StatPeriod,
  statPeriodNames,
} from '../core/options/addPeriodChoices.js';
import addTankChoices from '../core/options/addTankChoices.js';
import addUsernameOption from '../core/options/addUsernameOption.js';
import { WARGAMING_APPLICATION_ID } from '../core/process/args.js';
import { CommandRegistry } from '../events/interactionCreate.js';
import { AccountInfo, AllStats } from '../types/accountInfo.js';

export default {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName(cmdName('tankstats'))
    .setDescription('Stats for a tank over a period')
    .addSubcommand((option) =>
      option
        .setName('period')
        .setDescription('Pick from a predetermined periods')
        .addStringOption(addTankChoices)
        .addStringOption(addPeriodChoices)
        .addStringOption(addUsernameOption),
    )
    .addSubcommand((option) =>
      addCustomPeriodOption(option)
        .setName('customperiod')
        .addStringOption(addTankChoices)
        .setDescription('Custom periods')
        .addStringOption(addUsernameOption),
    ),

  async execute(interaction) {
    const tank = await resolveTankId(
      interaction,
      interaction.options.getString('tank')!,
    );
    const period = interaction.options.getString('period') as StatPeriod;
    const blitzAccount = await getBlitzAccount(interaction);
    const { id, server } = blitzAccount;
    const accountInfo = await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${server}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
    );
    const tankStats = await getTankStats(server, id);
    let stats: AllStats;
    const tankId = Number(tank);
    const isCustomPeriod =
      interaction.options.getSubcommand() === 'customperiod';
    let periodName: string;
    const startRaw = interaction.options.getInteger('start')!;
    const endRaw = interaction.options.getInteger('end')!;
    const start = Math.max(startRaw, endRaw);
    const end = Math.min(startRaw, endRaw);

    if (isCustomPeriod) {
      periodName = `${start} to ${end} days ago`;
    } else {
      periodName = statPeriodNames[period];
    }

    if (period === 'career') {
      stats =
        tankStats.find((stats) => stats.tank_id === tankId)?.all ??
        emptyAllStats;
    } else {
      const tankStatsOverTime = await getTankStatsOverTime(
        server,
        id,
        isCustomPeriod
          ? getPeriodStartFromDaysAgo(start)
          : getPeriodicStart(period),
        isCustomPeriod ? getPeriodStartFromDaysAgo(end) : getPeriodNow(),
      );

      stats = tankStatsOverTime[tankId] ?? emptyAllStats;
    }

    return [
      <Wrapper>
        <TitleBar
          name={accountInfo[id].nickname}
          nameDiscriminator={`(${resolveTankName(tankId)})`}
          image={tankopedia[tankId].images.normal}
          description={`${periodName} • ${new Date().toDateString()} • ${
            BLITZ_SERVERS[server]
          }`}
        />

        {stats.battles === 0 && <NoData type={NoDataType.BattlesInPeriod} />}
        {stats.battles > 0 && (
          <GenericAllStats
            stats={stats}
            supplementaryStats={{
              tier: tankopedia[tankId].tier,
              WN8: getWN8(tankAverages[tankId].all, stats),
            }}
          />
        )}

        <PoweredByBlitzStars />
      </Wrapper>,
      fullBlitzStarsStats(server, accountInfo[id].nickname),
      supportBlitzStars,
    ];
  },

  autocomplete: (interaction) => {
    tanksAutocomplete(interaction);
    usernameAutocomplete(interaction);
  },
} satisfies CommandRegistry;
