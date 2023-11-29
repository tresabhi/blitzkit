import { SlashCommandBuilder } from 'discord.js';
import NoData, { NoDataType } from '../components/NoData';
import * as Tanks from '../components/Tanks';
import TitleBar from '../components/TitleBar';
import Wrapper from '../components/Wrapper';
import { getAccountInfo } from '../core/blitz/getAccountInfo';
import { getClanAccountInfo } from '../core/blitz/getClanAccountInfo';
import getTankStats from '../core/blitz/getTankStats';
import getTreeType from '../core/blitz/getTreeType';
import resolveTankName from '../core/blitz/resolveTankName';
import { tankopediaInfo } from '../core/blitz/tankopediaInfo';
import { emblemIdToURL } from '../core/blitzkrieg/emblemIdToURL';
import { tankIcon } from '../core/blitzkrieg/tankIcon';
import {
  BlitzkriegTankopediaEntry,
  TIER_ROMAN_NUMERALS,
  Tier,
  tankopedia,
} from '../core/blitzkrieg/tankopedia';
import addTierChoices from '../core/discord/addTierChoices';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import autocompleteUsername from '../core/discord/autocompleteUsername';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand';
import { CommandRegistry } from '../events/interactionCreate';

export const ownedTanksCommand: CommandRegistry = {
  inProduction: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('owned-tanks')
    .setDescription("Shows a player's owned tanks")
    .addStringOption(addTierChoices)
    .addStringOption(addUsernameChoices),

  async handler(interaction) {
    const tier = Number(interaction.options.getString('tier'));
    const account = await resolvePlayerFromCommand(interaction);
    const { id, region: server } = account;
    const accountInfo = await getAccountInfo(server, id);
    const tankStats = await getTankStats(server, id);
    const filteredTanks = (
      await Promise.all(
        tankStats.map(async (tankData) => ({
          tankopedia: (await tankopedia)[tankData.tank_id]!,
          id: tankData.tank_id,
        })),
      )
    ).filter((tank) => tank.tankopedia?.tier === tier);
    const clanAccountInfo = await getClanAccountInfo(server, id, ['clan']);
    const groupedTanks: Record<string, BlitzkriegTankopediaEntry[]> = {};
    const nations: string[] = [];

    filteredTanks.forEach((tank) => {
      if (groupedTanks[tank.tankopedia.nation] === undefined) {
        groupedTanks[tank.tankopedia.nation] = [tank.tankopedia];
        nations.push(tank.tankopedia.nation);
      } else {
        groupedTanks[tank.tankopedia.nation].push(tank.tankopedia);
      }
    });

    nations.sort();

    return (
      <Wrapper>
        <TitleBar
          name={accountInfo.nickname}
          image={
            clanAccountInfo?.clan
              ? emblemIdToURL(clanAccountInfo.clan.emblem_set_id)
              : undefined
          }
          description={`Tier ${TIER_ROMAN_NUMERALS[tier as Tier]} tanks`}
        />

        {filteredTanks.length === 0 && <NoData type={NoDataType.TanksFound} />}

        {filteredTanks.length > 0 &&
          (await Promise.all(
            nations.map(async (nation) => {
              const tanks = groupedTanks[nation];
              const leftColumnSize = Math.ceil(tanks.length / 2);
              const leftColumn = tanks.slice(0, leftColumnSize);
              const rightColumn = tanks.slice(leftColumnSize);

              return (
                <Tanks.Root>
                  <Tanks.Title>
                    {(await tankopediaInfo).vehicle_nations[nation]}
                  </Tanks.Title>

                  <Tanks.Row>
                    <Tanks.Column>
                      {await Promise.all(
                        leftColumn.map(async (tank) => (
                          <Tanks.Item
                            key={tank.id}
                            name={await resolveTankName(tank.id)}
                            tankType={tank.type}
                            image={tankIcon(tank.id)}
                            treeType={await getTreeType(tank.id)}
                          />
                        )),
                      )}
                    </Tanks.Column>
                    <Tanks.Column>
                      {await Promise.all(
                        rightColumn.map(async (tank) => (
                          <Tanks.Item
                            key={tank.id}
                            name={await resolveTankName(tank.id)}
                            tankType={tank.type}
                            image={tankIcon(tank.id)}
                            treeType={await getTreeType(tank.id)}
                          />
                        )),
                      )}
                    </Tanks.Column>
                  </Tanks.Row>
                </Tanks.Root>
              );
            }),
          ))}
      </Wrapper>
    );
  },

  autocomplete: autocompleteUsername,
};
