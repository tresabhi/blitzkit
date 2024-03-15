import { escapeMarkdown } from 'discord.js';
import CommandWrapper from '../components/CommandWrapper';
import TitleBar from '../components/TitleBar';
import { equipmentPriceMatrix } from '../constants/equipmentPrice';
import { getAccountInfo } from '../core/blitz/getAccountInfo';
import { getClanAccountInfo } from '../core/blitz/getClanAccountInfo';
import getTankStats from '../core/blitz/getTankStats';
import resolveTankId from '../core/blitz/resolveTankId';
import { asset } from '../core/blitzkrieg/asset';
import { buildTechTreeLine } from '../core/blitzkrieg/buildTechTreeLine';
import { emblemIdToURL } from '../core/blitzkrieg/emblemIdToURL';
import { iconPng } from '../core/blitzkrieg/iconPng';
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
        throw new Error('No first owned tech tree found.');
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
                const turretXps = new Map<number, number>();
                const gunXps = new Map<number, number>();
                const engineXps = new Map<number, number>();
                const trackXps = new Map<number, number>();

                tank.turrets.forEach((turret) => {
                  if (turret.xp !== undefined) {
                    turretXps.set(turret.id, turret.xp);
                  }

                  turret.guns.forEach((gun) => {
                    if (gun.xp !== undefined) {
                      gunXps.set(gun.id, gun.xp);
                    }
                  });
                });

                tank.engines.forEach((engine) => {
                  if (engine.xp !== undefined) {
                    engineXps.set(engine.id, engine.xp);
                  }
                });

                tank.tracks.forEach((track) => {
                  if (track.xp !== undefined) {
                    trackXps.set(track.id, track.xp);
                  }
                });

                let moduleXp = 0;
                turretXps.forEach((value) => {
                  moduleXp += value;
                });
                gunXps.forEach((value) => {
                  moduleXp += value;
                });
                engineXps.forEach((value) => {
                  moduleXp += value;
                });
                trackXps.forEach((value) => {
                  moduleXp += value;
                });

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
                        justifyContent: 'center',
                        gap: 8,
                        padding: '16px 0',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          gap: 4,
                          alignItems: 'center',
                        }}
                      >
                        <img
                          src={await iconPng(asset('icons/currencies/xp.webp'))}
                          width={16}
                          height={16}
                        />
                        <span
                          style={{
                            fontSize: 16,
                            color: theme.colors.textHighContrast,
                          }}
                        >
                          Research:{' '}
                          {tank.xp?.toLocaleString(interaction.locale)}
                        </span>
                      </div>

                      {moduleXp > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            gap: 4,
                            alignItems: 'center',
                          }}
                        >
                          <img
                            src={await iconPng(
                              asset('icons/currencies/free-xp.webp'),
                            )}
                            width={16}
                            height={16}
                          />
                          <span
                            style={{
                              fontSize: 16,
                              color: theme.colors.textHighContrast,
                            }}
                          >
                            Upgrades: {moduleXp.toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          gap: 4,
                          alignItems: 'center',
                        }}
                      >
                        <img
                          src={await iconPng(
                            asset('icons/currencies/silver.webp'),
                          )}
                          width={16}
                          height={16}
                        />
                        <span
                          style={{
                            fontSize: 16,
                            color: theme.colors.textHighContrast,
                          }}
                        >
                          Purchase:{' '}
                          {tank.price.value.toLocaleString(interaction.locale)}
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: 4,
                          alignItems: 'center',
                        }}
                      >
                        <img
                          src={await iconPng(
                            asset('icons/currencies/silver.webp'),
                          )}
                          width={16}
                          height={16}
                        />
                        <span
                          style={{
                            fontSize: 16,
                            color: theme.colors.textHighContrast,
                          }}
                        >
                          Equipment:{' '}
                          {equipmentPriceMatrix[tank.tier]
                            .reduce((a, b) => a + 3 * b, 0)
                            .toLocaleString(interaction.locale)}
                        </span>
                      </div>
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
