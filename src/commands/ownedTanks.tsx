import CommandWrapper from '../components/CommandWrapper';
import NoData from '../components/NoData';
import * as Tanks from '../components/Tanks';
import TitleBar from '../components/TitleBar';
import { getAccountInfo } from '../core/blitz/getAccountInfo';
import { getClanAccountInfo } from '../core/blitz/getClanAccountInfo';
import getTankStats from '../core/blitz/getTankStats';
import { emblemIdToURL } from '../core/blitzkrieg/emblemIdToURL';
import {
  TankDefinition,
  Tier,
  tankDefinitions,
} from '../core/blitzkrieg/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../core/blitzkrieg/tankDefinitions/constants';
import addTierChoices from '../core/discord/addTierChoices';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import autocompleteUsername from '../core/discord/autocompleteUsername';
import { createLocalizedCommand } from '../core/discord/createLocalizedCommand';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand';
import { translator } from '../core/localization/translator';
import { CommandRegistry } from '../events/interactionCreate';

export const ownedTanksCommand = new Promise<CommandRegistry>((resolve) => {
  resolve({
    inProduction: true,
    inPublic: true,

    command: createLocalizedCommand('owned-tanks')
      .addStringOption(addTierChoices)
      .addStringOption(addUsernameChoices),

    async handler(interaction) {
      const { translate } = translator(interaction.locale);
      const tier = Number(interaction.options.getString('tier'));
      const account = await resolvePlayerFromCommand(interaction);
      const { id, region: server } = account;
      const accountInfo = await getAccountInfo(server, id);
      const tankStats = await getTankStats(server, id, interaction.locale);
      const filteredTanks = (
        await Promise.all(
          tankStats.map(async (tankData) => ({
            tankDefinitions: (await tankDefinitions)[tankData.tank_id]!,
            id: tankData.tank_id,
          })),
        )
      ).filter((tank) => tank.tankDefinitions?.tier === tier);
      const clanAccountInfo = await getClanAccountInfo(server, id, ['clan']);
      const groupedTanks: Record<string, TankDefinition[]> = {};
      const nations: string[] = [];

      filteredTanks.forEach((tank) => {
        if (groupedTanks[tank.tankDefinitions.nation] === undefined) {
          groupedTanks[tank.tankDefinitions.nation] = [tank.tankDefinitions];
          nations.push(tank.tankDefinitions.nation);
        } else {
          groupedTanks[tank.tankDefinitions.nation].push(tank.tankDefinitions);
        }
      });

      nations.sort();

      return (
        <CommandWrapper>
          <TitleBar
            title={accountInfo.nickname}
            image={
              clanAccountInfo?.clan
                ? emblemIdToURL(clanAccountInfo.clan.emblem_set_id)
                : undefined
            }
            description={translate('bot.commands.owned_tanks.body.subtitle', [
              TIER_ROMAN_NUMERALS[tier as Tier],
            ])}
          />

          {filteredTanks.length === 0 && (
            <NoData type="tanks_found" locale={interaction.locale} />
          )}

          {filteredTanks.length > 0 &&
            (await Promise.all(
              nations.map(async (nation) => {
                const tanks = groupedTanks[nation];
                const leftColumnSize = Math.ceil(tanks.length / 2);
                const leftColumn = tanks.slice(0, leftColumnSize);
                const rightColumn = tanks.slice(leftColumnSize);

                return (
                  <Tanks.Root key={nation}>
                    <Tanks.Title>
                      {translate(`common.nations.${nation}`)}
                    </Tanks.Title>

                    <Tanks.Row>
                      <Tanks.Column>
                        {await Promise.all(
                          leftColumn.map(async (tank) => (
                            <Tanks.Item
                              key={tank.id}
                              name={tank.name}
                              tankType={tank.class}
                              treeType={tank.treeType}
                            />
                          )),
                        )}
                      </Tanks.Column>
                      <Tanks.Column>
                        {await Promise.all(
                          rightColumn.map(async (tank) => (
                            <Tanks.Item
                              key={tank.id}
                              name={tank.name}
                              tankType={tank.class}
                              treeType={tank.treeType}
                            />
                          )),
                        )}
                      </Tanks.Column>
                    </Tanks.Row>
                  </Tanks.Root>
                );
              }),
            ))}
        </CommandWrapper>
      );
    },

    autocomplete: autocompleteUsername,
  });
});
