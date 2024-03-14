import { escapeMarkdown } from 'discord.js';
import CommandWrapper from '../components/CommandWrapper';
import TitleBar from '../components/TitleBar';
import { getAccountInfo } from '../core/blitz/getAccountInfo';
import { getClanAccountInfo } from '../core/blitz/getClanAccountInfo';
import getTankStats from '../core/blitz/getTankStats';
import resolveTankId from '../core/blitz/resolveTankId';
import { buildTechTreeLine } from '../core/blitzkrieg/buildTechTreeLine';
import { emblemIdToURL } from '../core/blitzkrieg/emblemIdToURL';
import { resolveAncestry } from '../core/blitzkrieg/resolveAncestry';
import { tankDefinitions } from '../core/blitzkrieg/tankDefinitions';
import addTankChoices from '../core/discord/addTankChoices';
import autocompleteTanks from '../core/discord/autocompleteTanks';
import { createLocalizedCommand } from '../core/discord/createLocalizedCommand';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand';
import { CommandRegistry } from '../events/interactionCreate';

export const researchCommand = new Promise<CommandRegistry>((resolve) => {
  resolve({
    inProduction: true,
    inPublic: true,

    command: createLocalizedCommand('research').addStringOption(addTankChoices),

    async handler(interaction) {
      const awaitedTankDefinitions = await tankDefinitions;
      const tankId = await resolveTankId(
        interaction.options.getString('tank', true),
        interaction.locale,
      );
      const tank = awaitedTankDefinitions[tankId];

      if (tank.treeType !== 'researchable') {
        return `# ${escapeMarkdown(tank.name)} is not researchable\n\nThis tank is not on the tech tree.`;
      }

      if (tank.tier === 1) {
        return `# ${escapeMarkdown(tank.name)} is not researchable\n\nThis tank is a tier I and is always unlocked.`;
      }

      const { id, region } = await resolvePlayerFromCommand(interaction);
      const tankStats = await getTankStats(region, id, interaction.locale);
      const ancestry = await resolveAncestry(tankId);
      const firstOwnedTechTree = ancestry.find((id) =>
        tankStats.some(({ tank_id }) => tank_id === id),
      );

      if (firstOwnedTechTree === undefined) {
        return `idk what to call this error lol`;
      }

      const line = await buildTechTreeLine(firstOwnedTechTree, tankId);
      const { nickname } = await getAccountInfo(region, id);
      const clan = (await getClanAccountInfo(region, id, ['clan']))?.clan;
      const clanImage = clan ? emblemIdToURL(clan.emblem_set_id) : undefined;

      return (
        <CommandWrapper>
          <TitleBar
            title={nickname}
            image={clanImage}
            description={`Research • ${tank.name}`}
          />
        </CommandWrapper>
      );
    },

    autocomplete(interaction) {
      autocompleteTanks(interaction, true);
    },
  });
});
