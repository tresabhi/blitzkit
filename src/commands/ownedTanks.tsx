import { SlashCommandBuilder } from 'discord.js';
import NoData, { NoDataType } from '../components/NoData';
import * as Tanks from '../components/Tanks';
import TitleBar from '../components/TitleBar';
import Wrapper from '../components/Wrapper';
import { WARGAMING_APPLICATION_ID } from '../constants/wargamingApplicationID';
import getTankStats from '../core/blitz/getTankStats';
import getTreeType from '../core/blitz/getTreeType';
import getWargamingResponse from '../core/blitz/getWargamingResponse';
import resolveTankName from '../core/blitz/resolveTankName';
import {
  TIER_ROMAN_NUMERALS,
  TankopediaEntry,
  Tier,
  tankopedia,
  tankopediaInfo,
} from '../core/blitz/tankopedia';
import addTierChoices from '../core/discord/addTierChoices';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import autocompleteUsername from '../core/discord/autocompleteUsername';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand';
import { CommandRegistry } from '../events/interactionCreate';
import { AccountInfo } from '../types/accountInfo';
import { PlayerClanInfo } from '../types/playerClanData';

const COMP_TANKS = [
  // light tanks
  24321, // t-100 lt
  20257, // sheridan
  3649, // bat chat
  19537, // vickers

  // heavy tanks
  6145, // is-4
  7169, // is-7
  10785, // t110e5
  12161, // strvk
  4481, // kranvagn
  22817, // m6 yoh
  6225, // fv215b
  5425, // wz 113
  7297, // 60tp
  58641, // vk 72
  6753, // type 71
];

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
    const accountInfo = await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${server}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
    );
    const tankStats = await getTankStats(server, id);
    const filteredTanks = (
      await Promise.all(
        tankStats.map(async (tankData) => ({
          tankopedia: (await tankopedia)[tankData.tank_id]!,
          tank_id: tankData.tank_id,
        })),
      )
    ).filter((tank) => tank.tankopedia?.tier === tier);
    const clanData = await getWargamingResponse<PlayerClanInfo>(
      `https://api.wotblitz.${server}/wotb/clans/accountinfo/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}&extra=clan`,
    );
    const groupedTanks: Record<string, TankopediaEntry[]> = {};
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
          name={accountInfo[id].nickname}
          nameDiscriminator={
            clanData[id]?.clan ? `[${clanData[id]?.clan?.tag}]` : undefined
          }
          image={
            clanData[id]?.clan
              ? `https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clanData[id]?.clan?.emblem_set_id}.png`
              : undefined
          }
          description={`Tier ${
            TIER_ROMAN_NUMERALS[tier as Tier]
          } tanks • ${new Date().toDateString()}`}
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
                            key={tank.tank_id}
                            name={await resolveTankName(tank.tank_id)}
                            tankType={tank.type}
                            image={tank.images?.normal}
                            treeType={await getTreeType(tank.tank_id)}
                          />
                        )),
                      )}
                    </Tanks.Column>
                    <Tanks.Column>
                      {await Promise.all(
                        rightColumn.map(async (tank) => (
                          <Tanks.Item
                            key={tank.tank_id}
                            name={await resolveTankName(tank.tank_id)}
                            tankType={tank.type}
                            image={tank.images?.normal}
                            treeType={await getTreeType(tank.tank_id)}
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

// TODO: make this work in the future
// console.log('Caching tank images...');
// TANKS.then((tanks) =>
//   jsxToSvg(
//     <div style={{ display: 'flex' }}>
//       {tanks.map(({ images, tank_id }) => {
//         return (
//           images.normal && <img key={tank_id} src={images.normal} width={0} />
//         );
//       })}
//     </div>,
//   ),
// ).then(() => console.log('Cached tank images'));
