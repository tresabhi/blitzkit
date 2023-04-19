import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import config from '../../config.json' assert { type: 'json' };

const SERVER_NAMES = { com: 'North America', eu: 'Europe', asia: 'Asia' };

export async function execute(
  interaction: ChatInputCommandInteraction<CacheType>,
) {
  const ign = interaction.options.getString('ign')!;
  const server = interaction.options.getString('server')!;
  const serverName = SERVER_NAMES[server as keyof typeof SERVER_NAMES];
  const players = (await fetch(
    `https://api.wotblitz.${server}/wotb/account/list/?application_id=${config.wargaming_application_id}&search=${ign}`,
  ).then((response) => response.json())) as
    | {
        data: { nickname: string; account_id: number }[] | undefined;
      }
    | undefined;

  if (players?.data?.[0].nickname === ign) {
    // good match
    const clanData = (await fetch(
      `https://api.wotblitz.${server}/wotb/clans/accountinfo/?application_id=${config.wargaming_application_id}&account_id=${players.data[0].account_id}&extra=clan`,
    ).then((response) => response.json())) as {
      data: { [key: number]: { clan: { tag: string } | null } };
    };
    const clan = clanData.data[players.data[0].account_id].clan;
    const clanTag = clan === null ? '' : ` [${clan.tag}]`;

    if (interaction.member && interaction.guild) {
      const member = interaction.guild?.members.cache.get(
        interaction.member?.user.id,
      );

      member
        ?.setNickname(`${ign}${clanTag}`)
        .then(async () => {
          await member.roles.remove(config.discord_verify_role);
          await member.roles.add(config.discord_peasant_role);
          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor('#82ff29')
                .setTitle(`${interaction.user.username} is verified`)
                .setDescription(`The user is now verified as ${ign}${clanTag}`),
            ],
          });

          console.log(
            `${interaction.user.username} verified as ${ign}${clanTag}`,
          );
        })
        .catch(async () => {
          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor('#ff4747')
                .setTitle(`${interaction.user.username} failed to verify`)
                .setDescription(
                  'I may not have the permission to change your nickname.',
                ),
            ],
          });

          console.warn(
            `${interaction.user.username} failed to verify as ${ign}${clanTag}`,
          );
        });
    }
  } else {
    // no exact match
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#ff4747')
          .setTitle(`Account not found`)
          .setDescription(
            `Are you sure your username is exactly "${ign}" in the ${serverName} server? I found ${
              players?.data
                ? players.data.length < 100
                  ? players.data.length
                  : 'over 100'
                : 'no'
            } similarly spelled account${
              players?.data?.length !== 1 ? 's' : ''
            }. Try re-running the command. There might be a typo and capitalization matters.`,
          ),
      ],
    });
  }
}

export const data = new SlashCommandBuilder()
  .setName('verify')
  .setDescription('Verifies the user with Blitz')
  .addStringOption((option) =>
    option
      .setName('server')
      .setDescription('The Blitz server you are in')
      .setRequired(true)
      .addChoices(
        { name: SERVER_NAMES.com, value: 'com' },
        { name: SERVER_NAMES.eu, value: 'eu' },
        { name: SERVER_NAMES.asia, value: 'asia' },
      ),
  )
  .addStringOption((option) =>
    option
      .setName('ign')
      .setDescription('The username you use in Blitz')
      .setRequired(true),
  );
