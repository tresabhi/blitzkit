//  _____    _____ _    _          _      _         _____ ____  __  __ ______   ____          _____ _  __
// |_   _|  / ____| |  | |   /\   | |    | |       / ____/ __ \|  \/  |  ____| |  _ \   /\   / ____| |/ /
//   | |   | (___ | |__| |  /  \  | |    | |      | |   | |  | | \  / | |__    | |_) | /  \ | |    | ' /
//   | |    \___ \|  __  | / /\ \ | |    | |      | |   | |  | | |\/| |  __|   |  _ < / /\ \| |    |  <
//  _| |_   ____) | |  | |/ ____ \| |____| |____  | |___| |__| | |  | | |____  | |_) / ____ \ |____| . \
// |_____| |_____/|_|  |_/_/    \_\______|______|  \_____\____/|_|  |_|______| |____/_/    \_\_____|_|\_\

// import { SlashCommandBuilder, escapeMarkdown } from 'discord.js';
// import markdownEscape from 'markdown-escape';
// import { getAccountAchievements } from '../core/blitz/getAccountAchievements';
// import { getAccountInfo } from '../core/blitz/getAccountInfo';
// import { getClanInfo } from '../core/blitz/getClanInfo';
// import { PlayerHistoriesRaw } from '../LEGACY_core/blitzstars/getPlayerHistories';
// import getTimeDaysAgo from '../LEGACY_core/blitzstars/getTimeDaysAgo';
// import addClanChoices from '../LEGACY_core/discord/addClanChoices';
// import autocompleteClan from '../LEGACY_core/discord/autocompleteClan';
// import embedWarning from '../LEGACY_core/discord/embedWarning';
// import resolveClanFromCommand from '../LEGACY_core/discord/resolveClanFromCommand';
// import { CommandRegistry } from '../events/interactionCreate';

// export const clanEventCommand: CommandRegistry = {
//   inProduction: false,
//   inPublic: true,

//   command: new SlashCommandBuilder()
//     .setName('clan-event')
//     .setDescription('Lists all inactive players')
//     .addStringOption(addClanChoices),

//   async handler(interaction) {
//     const { region, id } = await resolveClanFromCommand(interaction);
//     const clan = await getClanInfo(region, id);
//     const [players, achievements, previousJointVictories] = await Promise.all([
//       getAccountInfo(region, clan.members_ids),
//       getAccountAchievements(region, clan.members_ids),
//       Promise.all(
//         clan.members_ids.map((id) =>
//           fetch(`https://www.blitzstars.com/api/playerstats/${id}`)
//             .then((response) => response.json() as Promise<PlayerHistoriesRaw>)
//             .then((data) => ({
//               id,
//               jointVictory: data[0]?.achievements.jointVictoryCount as
//                 | number
//                 | undefined,
//             })),
//         ),
//       ).then((data) =>
//         data.reduce<Record<number, number | undefined>>(
//           (accumulator, value) => ({
//             ...accumulator,
//             [value.id]: value.jointVictory,
//           }),
//           {},
//         ),
//       ),
//     ]);
//     const jointVictories = clan.members_ids.map((id) => ({
//       id,
//       joinVictory:
//         players[id].last_battle_time > getTimeDaysAgo(region, 1)
//           ? previousJointVictories[id] === undefined
//             ? 0
//             : achievements[id].max_series.jointVictory -
//               previousJointVictories[id]!
//           : 0,
//     }));

//     return [
//       `# ${escapeMarkdown(clan.name)} [${escapeMarkdown(
//         clan.tag,
//       )}]'s platoon wins today: ${(
//         jointVictories.reduce(
//           (accumulator, { joinVictory }) => accumulator + joinVictory,
//           0,
//         ) / 2
//       ).toFixed(0)}\n${jointVictories
//         .filter(({ joinVictory }) => joinVictory)
//         .sort((a, b) => b.joinVictory - a.joinVictory)
//         .map(
//           ({ id, joinVictory }) =>
//             `- ${markdownEscape(players[id].nickname)}: ${joinVictory}`,
//         )
//         .join('\n')}`,

//       embedWarning(
//         'This is an approximation!',
//         "Wargaming provides very little information about platoons publicly. Caveats:\n- Players in two different clans platooning artificially inflates the total count\n- Game-mode battles aren't counted since Wargaming doesn't publicly share that data\n- This command is also subject to Blitzkrieg's reset times (use `/about timezones` for more info)",
//       ),
//     ];
//   },

//   autocomplete: autocompleteClan,
// };
