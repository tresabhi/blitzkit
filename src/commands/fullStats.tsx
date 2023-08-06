import { SlashCommandBuilder } from 'discord.js';
import { CYCLIC_API } from '../constants/cyclic';
import getWargamingResponse from '../core/blitz/getWargamingResponse';
import resolveTankId from '../core/blitz/resolveTankId';
import addStatTypeSubCommandGroups from '../core/discord/addStatTypeSubCommandGroups';
import autocompleteTanks from '../core/discord/autocompleteTanks';
import autocompleteUsername from '../core/discord/autocompleteUsername';
import interactionToURL from '../core/discord/interactionToURL';
import linkButton from '../core/discord/linkButton';
import primaryButton from '../core/discord/primaryButton';
import resolvePeriodFromButton from '../core/discord/resolvePeriodFromButton';
import resolvePeriodFromCommand from '../core/discord/resolvePeriodFromCommand';
import resolvePlayerFromButton from '../core/discord/resolvePlayerFromButton';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand';
import { secrets } from '../core/node/secrets';
import { CommandRegistryRaw } from '../events/interactionCreate';
import fullStats from '../renderers/fullStats';
import { StatType } from '../renderers/stats';
import { AccountInfo } from '../types/accountInfo';

export const fullStatsCommand = new Promise<CommandRegistryRaw>(
  async (resolve) => {
    const command = await addStatTypeSubCommandGroups(
      new SlashCommandBuilder()
        .setName('full-stats')
        .setDescription('Full in-game statistics'),
    );

    resolve({
      inProduction: true,
      inDevelopment: false,
      inPublic: true,

      command,

      async handler(interaction) {
        const commandGroup = interaction.options.getSubcommandGroup(
          true,
        ) as StatType;
        const player = await resolvePlayerFromCommand(interaction);
        const period = resolvePeriodFromCommand(player.region, interaction);
        const tankIdRaw = interaction.options.getString('tank')!;
        const tankId =
          commandGroup === 'tank' ? await resolveTankId(tankIdRaw) : null;
        const start = interaction.options.getInteger('start');
        const end = interaction.options.getInteger('end');
        const path = interactionToURL(interaction, {
          ...player,
          tankId,
          start,
          end,
        });
        const { nickname } = (
          await getWargamingResponse<AccountInfo>(
            `https://api.wotblitz.${player.region}/wotb/account/info/?application_id=${secrets.WARGAMING_APPLICATION_ID}&account_id=${player.id}`,
          )
        )[player.id];

        return [
          await fullStats(commandGroup, period, player, tankId),
          primaryButton(path, 'Refresh'),
          // linkButton(`${CYCLIC_API}/${path}`, 'Embed'),
          linkButton(
            `https://www.blitzstars.com/player/${player.region}/${nickname}`,
            'BlitzStars',
          ),
        ];
      },

      autocomplete: (interaction) => {
        autocompleteUsername(interaction);
        autocompleteTanks(interaction);
      },

      async button(interaction) {
        const url = new URL(`${CYCLIC_API}/${interaction.customId}`);
        const path = url.pathname.split('/').filter(Boolean);
        const commandGroup = path[1] as StatType;
        const player = await resolvePlayerFromButton(interaction);
        const period = resolvePeriodFromButton(player.region, interaction);

        return await fullStats(
          commandGroup,
          period,
          player,
          parseInt(url.searchParams.get('tankId')!),
        );
      },
    });
  },
);
