import { teal } from '@radix-ui/colors';
import { AttachmentBuilder, SlashCommandBuilder } from 'discord.js';
import { Glow } from '../components/AllStatsOverview/components/WN8Display/components/Glow';
import Wrapper from '../components/Wrapper';
import { REGION_NAMES_SHORT, Region } from '../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../constants/wargamingApplicationID';
import getWargamingResponse from '../core/blitz/getWargamingResponse';
import { linkBlitzAndDiscord } from '../core/cockroackdb/discordBlitz';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import autocompleteUsername from '../core/discord/autocompleteUsername';
import embedNegative from '../core/discord/embedNegative';
import { CommandRegistry } from '../events/interactionCreate';
import { theme } from '../stitches.config';
import { AccountInfo } from '../types/accountInfo';
import { PlayerClanData } from '../types/playerClanData';

const serverAndIdPattern = /(com|eu|asia)\/[0-9]+/;

export const verifyCommand: CommandRegistry = {
  inProduction: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Links your Blitz and Discord account')
    .addStringOption((option) => addUsernameChoices(option).setRequired(true)),

  async handler(interaction) {
    // const blitzAccount = await resolvePlayerFromCommand(interaction);
    // const { id, region: server } = blitzAccount;
    // const accountInfo = await getWargamingResponse<AccountInfo>(
    //   `https://api.wotblitz.${server}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
    // );
    // const clanData = await getWargamingResponse<PlayerClanData>(
    //   `https://api.wotblitz.${server}/wotb/clans/accountinfo/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}&extra=clan`,
    // );
    // const clan = clanData[id]?.clan;
    // const clanTag = clan ? ` [${clan!.tag}]` : '';
    // const member =
    //   interaction.member &&
    //   interaction.guild?.members.cache.get(interaction.member?.user.id);

    // if (!interaction.guild?.members.me?.permissions.has('ManageNicknames')) {
    //   return embedNegative(
    //     `${markdownEscape(interaction.user.username)} failed to verify`,
    //     "I don't have the permission to change your nickname.",
    //   );
    // }
    // if (!interaction.member || !member) {
    //   return embedNegative(
    //     `${interaction.user.username} is not in this server`,
    //     "I couldn't find this person in this server. Did they leave?",
    //   );
    // }

    // try {
    //   await member.setNickname(`${accountInfo[id].nickname}${clanTag}`);

    //   if (interaction.guildId === discord.sklld_guild_id) {
    //     if (!interaction.guild?.members.me?.permissions.has('ManageRoles')) {
    //       return embedNegative(
    //         `${markdownEscape(interaction.user.username)} failed to verify`,
    //         "I don't have the permission to change your manage roles.",
    //       );
    //     }

    //     await member.roles.remove(discord.sklld_verify_role);
    //     await member.roles.add(discord.sklld_peasant_role);
    //   }

    //   return embedPositive(
    //     `${interaction.user.username} is verified`,
    //     `The user is now verified as ${markdownEscape(
    //       accountInfo[id].nickname,
    //     )}${markdownEscape(clanTag)}`,
    //   );
    // } catch (error) {
    //   return embedNegative(
    //     `${interaction.user.username} failed to verify`,
    //     "I can't change your nickname because you have higher permissions than me. Try setting your nickname to your Blitz username manually.",
    //   );
    // }

    const username = interaction.options.getString('username', true);

    if (serverAndIdPattern.test(username)) {
      const [region, idString] = username.split('/');
      const id = parseInt(idString);
      const discordId = parseInt(interaction.user.id);
      // const account = (
      //   await getWargamingResponse<AccountInfo>(
      //     `https://api.wotblitz.${region}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
      //   )
      // )[id];
      // const clan = await getWargamingResponse<PlayerClanData>(
      //   `https://api.wotblitz.${region}/wotb/clans/accountinfo/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}&extra=clan`,
      // );
      const [account, clan] = await Promise.all([
        getWargamingResponse<AccountInfo>(
          `https://api.wotblitz.${region}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
        ),
        getWargamingResponse<PlayerClanData>(
          `https://api.wotblitz.${region}/wotb/clans/accountinfo/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}&extra=clan`,
        ),
      ]);

      await linkBlitzAndDiscord(discordId, region as Region, id);

      return (
        <Wrapper fat>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Glow color={teal.teal9} rotation={90} />

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={
                    interaction.user.avatarURL({ extension: 'png' }) ??
                    'https://i.stack.imgur.com/l60Hf.png'
                  }
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    objectFit: 'cover',
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 32,
                      color: theme.colors.textHighContrast,
                      fontWeight: 900,
                      maxWidth: 240,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {interaction.user.displayName}
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      color: theme.colors.textLowContrast,
                    }}
                  >
                    @{interaction.user.username}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  color: theme.colors.textLowContrast_teal,
                }}
              >
                <img
                  src="https://i.imgur.com/jIcRgog.png"
                  style={{
                    width: 16,
                    height: 16,
                  }}
                />
                <span style={{ fontSize: 16 }}>Accounts linked</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {clan[id]?.clan ? (
                  <img
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      objectFit: 'cover',
                    }}
                    src={`https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clan[id]?.clan?.emblem_set_id}.png`}
                  />
                ) : null}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 32,
                      color: theme.colors.textHighContrast,
                      fontWeight: 900,
                      maxWidth: 240,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {account[id].nickname}
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      color: theme.colors.textLowContrast,
                    }}
                  >
                    {clan[id]?.clan ? `[${clan[id]?.clan?.tag}] - ` : ''}
                    {REGION_NAMES_SHORT[region as Region]}
                  </span>
                </div>
              </div>
            </div>

            <Glow color={teal.teal9} rotation={-90} />
          </div>
        </Wrapper>
      );
    } else {
      return [
        embedNegative(
          'Please select from the options',
          'Follow the procedure like the video above. The search results may take a while to show up.',
        ),
        new AttachmentBuilder('https://i.imgur.com/2p6GFgC.gif'),
      ];
    }
  },

  autocomplete: autocompleteUsername,
};
