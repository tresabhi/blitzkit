import { SlashCommandBuilder } from 'discord.js';
import { TreeTypeString } from '../components/Tanks';
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
import stats, { MultiTankFilters, StatType } from '../renderers/stats';
import { AccountInfo } from '../types/accountInfo';

export const statsCommand = new Promise<CommandRegistryRaw>(async (resolve) => {
  const command = await addStatTypeSubCommandGroups(
    new SlashCommandBuilder()
      .setName('stats')
      .setDescription('Regular battles statistics'),
  );

  resolve({
    inProduction: true,
    inDevelopment: true,
    inPublic: true,

    command,

    async handler(interaction) {
      const commandGroup = interaction.options.getSubcommandGroup(
        true,
      ) as StatType;
      const player = await resolvePlayerFromCommand(interaction);
      const resolvedPeriod = resolvePeriodFromCommand(
        player.region,
        interaction,
      );
      const period = interaction.options.getString('period');
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
        period,
      });
      const { nickname } = (
        await getWargamingResponse<AccountInfo>(
          `https://api.wotblitz.${player.region}/wotb/account/info/?application_id=${secrets.WARGAMING_APPLICATION_ID}&account_id=${player.id}`,
        )
      )[player.id];

      const tierOption = interaction.options.getString('tier');

      return [
        await stats(
          commandGroup,
          resolvedPeriod,
          player,
          commandGroup === 'tank'
            ? tankId
            : commandGroup === 'multi-tank'
            ? ({
                'tank-type':
                  interaction.options.getString('tank-type') ?? undefined,
                nation: interaction.options.getString('nation') ?? undefined,
                tier: tierOption ? parseInt(tierOption) : undefined,
                'tree-type': (interaction.options.getString('tree-type') ??
                  undefined) as TreeTypeString | undefined,
              } satisfies Partial<MultiTankFilters>)
            : null,
        ),
        primaryButton(path, 'Refresh'),
        linkButton(`${CYCLIC_API}/${path}`, 'Embed'),
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

      return await stats(
        commandGroup,
        period,
        player,
        commandGroup === 'tank'
          ? parseInt(url.searchParams.get('tankId')!)
          : commandGroup === 'multi-tank'
          ? ({
              'tank-type': url.searchParams.get('tank-type')!,
              nation: url.searchParams.get('nation')!,
              tier: parseInt(url.searchParams.get('tier')!),
              'tree-type': url.searchParams.get('tree-type') as TreeTypeString,
            } satisfies MultiTankFilters)
          : null,
      );
    },
  });
});
