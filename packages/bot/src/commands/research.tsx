import {
  asset,
  equipmentPriceMatrix,
  TANK_ICONS,
  tankDefinitions,
  TIER_ROMAN_NUMERALS,
} from '@blitzkit/core';
import { escapeMarkdown, Locale } from 'discord.js';
import { getAccountInfo } from '../../../website/src/core/blitz/getAccountInfo';
import { getClanAccountInfo } from '../../../website/src/core/blitz/getClanAccountInfo';
import getTankStats from '../../../website/src/core/blitz/getTankStats';
import resolveTankId from '../../../website/src/core/blitz/resolveTankId';
import { buildTechTreeLine } from '../../../website/src/core/blitzkit/buildTechTreeLine';
import { emblemURL } from '../../../website/src/core/blitzkit/emblemURL';
import { iconPng } from '../../../website/src/core/blitzkit/iconPng';
import { resolveAncestry } from '../../../website/src/core/blitzkit/resolveAncestry';
import { tankIconPng } from '../../../website/src/core/blitzkit/tankIconPng';
import CommandWrapper from '../components/CommandWrapper';
import TitleBar from '../components/TitleBar';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import autocompleteTanks from '../core/discord/autocompleteTanks';
import { createLocalizedCommand } from '../core/discord/createLocalizedCommand';
import { localizationObject } from '../core/discord/localizationObject';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand';
import { translator } from '../core/localization/translator';
import { CommandRegistry } from '../events/interactionCreate';
import { theme } from '../stitches.config';

export const researchCommand = new Promise<CommandRegistry>((resolve) => {
  const { t } = translator(Locale.EnglishUS);

  resolve({
    command: createLocalizedCommand('research')
      .addStringOption((option) =>
        option
          .setName(t`bot.commands.research.options.target_tank`)
          .setNameLocalizations(
            localizationObject('bot.commands.research.options.target_tank'),
          )
          .setDescription(
            t`bot.commands.research.options.target_tank.description`,
          )
          .setDescriptionLocalizations(
            localizationObject(
              'bot.commands.research.options.target_tank.description',
            ),
          )
          .setAutocomplete(true)
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName(t`bot.commands.research.options.starting_tank`)
          .setNameLocalizations(
            localizationObject('bot.commands.research.options.starting_tank'),
          )
          .setDescription(
            t`bot.commands.research.options.starting_tank.description`,
          )
          .setDescriptionLocalizations(
            localizationObject(
              'bot.commands.research.options.starting_tank.description',
            ),
          )
          .setAutocomplete(true)
          .setRequired(false),
      )
      .addStringOption(addUsernameChoices),

    async handler(interaction) {
      const { t, translate } = translator(interaction.locale);
      const awaitedTankDefinitions = await tankDefinitions;
      const targetTankId = await resolveTankId(
        interaction.options.getString('target-tank', true),
        interaction.locale,
        true,
      );
      const startingTankRaw = interaction.options.getString('starting-tank');
      const targetTank = awaitedTankDefinitions[targetTankId];
      const { id, region } = await resolvePlayerFromCommand(interaction);
      let startingTankId: number;
      const targetTankAncestry = await resolveAncestry(targetTankId);

      if (startingTankRaw) {
        startingTankId = await resolveTankId(
          startingTankRaw,
          interaction.locale,
          true,
        );

        if (targetTankId === startingTankId) {
          return translate('bot.commands.research.errors.start_end_equal', [
            escapeMarkdown(targetTank.name),
          ]);
        }

        const startingTank = awaitedTankDefinitions[startingTankId];

        if (startingTank.tier > targetTank.tier) {
          return translate('bot.commands.research.errors.unordered', [
            escapeMarkdown(startingTank.name),
            escapeMarkdown(targetTank.name),
            escapeMarkdown(targetTank.name),
          ]);
        }

        if (!targetTankAncestry.includes(startingTankId)) {
          return translate('bot.commands.research.errors.tanks_not_on_line', [
            escapeMarkdown(targetTank.name),
            escapeMarkdown(startingTank.name),
          ]);
        }
      } else {
        if (targetTank.treeType !== 'researchable') {
          return translate('bot.commands.research.errors.non_tech_tree', [
            escapeMarkdown(targetTank.name),
          ]);
        }

        if (targetTank.tier === 1) {
          return translate('bot.commands.research.errors.tier_1', [
            escapeMarkdown(targetTank.name),
          ]);
        }

        const tankStats = await getTankStats(region, id);

        if (tankStats === null) {
          return t`bot.common.errors.no_tank_stats`;
        }

        if (tankStats.some(({ tank_id }) => tank_id === targetTankId)) {
          return translate('bot.commands.research.errors.already_researched', [
            escapeMarkdown(targetTank.name),
          ]);
        }

        const foundAncestor = targetTankAncestry.find(
          (id) =>
            awaitedTankDefinitions[id].tier === 1 ||
            tankStats.some(({ tank_id }) => tank_id === id),
        );

        if (foundAncestor === undefined) {
          throw new Error('No first owned tech tree found.');
        }

        startingTankId = foundAncestor;
      }

      const techTreeLine = await buildTechTreeLine(
        startingTankId,
        targetTankId,
      );

      const line = [...techTreeLine, startingTankId].reverse();
      const { nickname } = await getAccountInfo(region, id);
      const clan = (await getClanAccountInfo(region, id, ['clan']))?.clan;
      const clanImage = clan ? emblemURL(clan.emblem_set_id) : undefined;
      const costs = await Promise.all(
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

          return {
            research: tank.xp,
            upgrades: moduleXp,
            purchase: tank.price.value,
            equipment: equipmentPriceMatrix[tank.tier].reduce(
              (a, b) => a + 3 * b,
              0,
            ),
          };
        }),
      );

      const image = (
        <CommandWrapper>
          <TitleBar
            title={nickname}
            image={clanImage}
            description={`${t`bot.commands.research.body.subtitle`} • ${
              targetTank.name
            }`}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div
              style={{
                display: 'flex',
                borderRadius: 4,
                backgroundColor: theme.colors.appBackground2,
                border: theme.borderStyles.subtle,
              }}
            >
              <div style={{ width: 48 }}></div>

              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  right: 24,
                }}
              >
                <span
                  style={{
                    color: theme.colors.textHighContrast,
                  }}
                >
                  {t`bot.commands.research.body.total`}
                </span>
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
                    alt="XP icon"
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
                    Experience:{' '}
                    {costs
                      .reduce((a, b) => a + (b.research ?? 0) + b.upgrades, 0)
                      .toLocaleString(interaction.locale)}
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
                    alt="Silver icon"
                    src={await iconPng(asset('icons/currencies/silver.webp'))}
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
                    {costs
                      .reduce((a, b) => a + b.purchase, 0)
                      .toLocaleString(interaction.locale)}
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
                    alt="Silver icon"
                    src={await iconPng(asset('icons/currencies/silver.webp'))}
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
                    {costs
                      .reduce((a, b) => a + b.equipment, 0)
                      .toLocaleString(interaction.locale)}
                  </span>
                </div>
              </div>
            </div>

            {await Promise.all(
              line.map(async (id, index) => {
                const tank = awaitedTankDefinitions[id];

                return (
                  <div
                    key={id}
                    style={{
                      display: 'flex',
                      borderRadius: 4,
                      backgroundColor: theme.colors.appBackground2,
                      border: theme.borderStyles.subtle,
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
                      <img
                        alt="Tank icon"
                        src={await tankIconPng(id)}
                        style={{
                          height: 100,
                          width: 100,
                          objectFit: 'contain',
                          position: 'absolute',
                          left: '25%',
                          top: 0,
                        }}
                      />

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
                          alt={tank.name}
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
                          alt="XP icon"
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
                          {translate('bot.commands.research.body.research', [
                            `${costs[index].research?.toLocaleString(
                              interaction.locale,
                            )}`,
                          ])}
                        </span>
                      </div>

                      {costs[index].upgrades > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            gap: 4,
                            alignItems: 'center',
                          }}
                        >
                          <img
                            alt="Free XP icon"
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
                            {translate('bot.commands.research.body.upgrades', [
                              costs[index].upgrades.toLocaleString(),
                            ])}
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
                          alt="Silver icon"
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
                          {translate('bot.commands.research.body.purchase', [
                            costs[index].purchase.toLocaleString(
                              interaction.locale,
                            ),
                          ])}
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
                          alt="Silver icon"
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
                          {translate('bot.commands.research.body.equipment', [
                            costs[index].equipment.toLocaleString(
                              interaction.locale,
                            ),
                          ])}
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

      return startingTankRaw
        ? image
        : [t`bot.commands.research.body.estimation`, image];
    },

    autocomplete(interaction) {
      autocompleteTanks(interaction, true, ['target-tank', 'starting-tank']);
    },
  });
});
