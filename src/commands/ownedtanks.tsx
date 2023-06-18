import { SlashCommandBuilder } from 'discord.js';
import NoData, { NoDataType } from '../components/NoData.js';
import PoweredByWargaming from '../components/PoweredByWargaming.js';
import * as Tanks from '../components/Tanks/index.js';
import TitleBar from '../components/TitleBar.js';
import Wrapper from '../components/Wrapper.js';
import { BLITZ_SERVERS } from '../constants/servers.js';
import usernameAutocomplete from '../core/autocomplete/username.js';
import getBlitzAccount from '../core/blitz/getBlitzAccount.js';
import getTankStats from '../core/blitz/getTankStats.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import { TIER_ROMAN_NUMERALS, tankopedia } from '../core/blitz/tankopedia.js';
import cmdName from '../core/interaction/cmdName.js';
import addUsernameOption from '../core/options/addUsernameOption.js';
import { WARGAMING_APPLICATION_ID } from '../core/process/args.js';
import { CommandRegistry } from '../events/interactionCreate.js';
import { AccountInfo } from '../types/accountInfo.js';
import { PlayerClanData } from '../types/playerClanData.js';

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

export default {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName(cmdName('ownedtanks'))
    .setDescription("Shows a player's owned tanks")
    .addStringOption((option) =>
      option
        .setName('tier')
        .setDescription('The tier you want to see')
        .setChoices(
          { name: 'Tier I', value: '1' },
          { name: 'Tier II', value: '2' },
          { name: 'Tier III', value: '3' },
          { name: 'Tier IV', value: '4' },
          { name: 'Tier V', value: '5' },
          { name: 'Tier VI', value: '6' },
          { name: 'Tier VII', value: '7' },
          { name: 'Tier VIII', value: '8' },
          { name: 'Tier IX', value: '9' },
          { name: 'Tier X', value: '10' },
        )
        .setRequired(true),
    )
    .addStringOption(addUsernameOption),

  async execute(interaction) {
    const tier = Number(interaction.options.getString('tier'));
    const account = await getBlitzAccount(interaction);
    const { id, server } = account;
    const accountInfo = await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${server}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
    );
    const tankStats = await getTankStats(server, id);
    const tanks = tankStats
      .map((tankData) => tankopedia[tankData.tank_id])
      .filter((tank) => tank?.tier === tier);
    const clanData = await getWargamingResponse<PlayerClanData>(
      `https://api.wotblitz.${server}/wotb/clans/accountinfo/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}&extra=clan`,
    );

    return (
      <Wrapper>
        {/* TODO: integrate some of these into title bar */}
        <TitleBar
          name={accountInfo[id].nickname}
          nameDiscriminator={`(Tier ${TIER_ROMAN_NUMERALS[tier]})`}
          image={
            clanData[id]?.clan
              ? `https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clanData[id]?.clan?.emblem_set_id}.png`
              : undefined
          }
          description={`Owned tanks • ${new Date().toDateString()} • ${
            BLITZ_SERVERS[server]
          }`}
        />

        {tanks.length === 0 && <NoData type={NoDataType.TanksFound} />}

        {tanks.length > 0 && (
          <Tanks.Root>
            {tanks.map((tank) => (
              <Tanks.Item
                key={tank.tank_id}
                name={tank.name}
                type={tank.type}
                icon={tank.images.normal}
              />
            ))}
          </Tanks.Root>
        )}

        <PoweredByWargaming />
      </Wrapper>
    );
  },

  autocomplete: usernameAutocomplete,
} satisfies CommandRegistry;
