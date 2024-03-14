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
import {
  TANK_ICONS,
  TIER_ROMAN_NUMERALS,
} from '../core/blitzkrieg/tankDefinitions/constants';
import { tankIconPng } from '../core/blitzkrieg/tankIconPng';
import addTankChoices from '../core/discord/addTankChoices';
import autocompleteTanks from '../core/discord/autocompleteTanks';
import { createLocalizedCommand } from '../core/discord/createLocalizedCommand';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand';
import { CommandRegistry } from '../events/interactionCreate';
import { theme } from '../stitches.config';

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
      const firstOwnedTechTree = ancestry.find(
        (id) =>
          awaitedTankDefinitions[id].tier === 1 ||
          tankStats.some(({ tank_id }) => tank_id === id),
      );

      if (firstOwnedTechTree === undefined) {
        return `idk what to call this error lol`;
      }

      const line = (
        await buildTechTreeLine(firstOwnedTechTree, tankId)
      ).reverse();
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

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {await Promise.all(
              line.map(async (id) => {
                const tank = awaitedTankDefinitions[id];

                return (
                  <div
                    key={id}
                    style={{
                      display: 'flex',
                      borderRadius: 4,
                      backgroundColor: theme.colors.appBackground2,
                      border: `1px solid ${theme.colors.componentInteractive}`,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span
                        style={{
                          color: theme.colors.textLowContrast,
                          fontSize: 16,
                        }}
                      >
                        {TIER_ROMAN_NUMERALS[tank.tier]}
                      </span>
                    </div>

                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        position: 'relative',
                        right: '5%',
                      }}
                    >
                      <div
                        style={{
                          height: 120,
                          width: 240,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          left: '25%',
                          top: '5%',
                        }}
                      >
                        <img
                          src={await tankIconPng(id)}
                          style={{
                            height: '100%',
                            position: 'absolute',
                            objectFit: 'contain',
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: 4,
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'absolute',
                          bottom: 8,
                          left: '50%',
                          transform: 'translateX(-50%)',
                        }}
                      >
                        <img
                          src={TANK_ICONS[tank.class]}
                          width={16}
                          height={16}
                        />

                        <span
                          style={{
                            color: theme.colors.textHighContrast,
                          }}
                        >
                          {tank.name}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        padding: '16px 0',
                      }}
                    >
                      <span>Research: 144,000</span>
                      <span>Upgrades: 62,000</span>
                      <span>Purchase: 1,500,000</span>
                      <span>Equipment: 450,000</span>
                    </div>
                  </div>
                );
              }),
            )}
          </div>
        </CommandWrapper>
      );
    },

    autocomplete(interaction) {
      autocompleteTanks(interaction, true);
    },
  });
});
