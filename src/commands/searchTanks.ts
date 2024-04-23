//  _____    _____ _    _          _      _         _____ ____  __  __ ______   ____          _____ _  __
// |_   _|  / ____| |  | |   /\   | |    | |       / ____/ __ \|  \/  |  ____| |  _ \   /\   / ____| |/ /
//   | |   | (___ | |__| |  /  \  | |    | |      | |   | |  | | \  / | |__    | |_) | /  \ | |    | ' /
//   | |    \___ \|  __  | / /\ \ | |    | |      | |   | |  | | |\/| |  __|   |  _ < / /\ \| |    |  <
//  _| |_   ____) | |  | |/ ____ \| |____| |____  | |___| |__| | |  | | |____  | |_) / ____ \ |____| . \
// |_____| |_____/|_|  |_/_/    \_\______|______|  \_____\____/|_|  |_|______| |____/_/    \_\_____|_|\_\

// import { SlashCommandBuilder } from 'discord.js';
// import { go } from 'fuzzysort';
// import markdownEscape from 'markdown-escape';
// import { tankNames } from '../core/blitzkit/tankDefinitions';
// import addTankChoices from '../core/discord/addTankChoices';
// import embedInfo from '../core/discord/embedInfo';
// import { CommandRegistry } from '../events/interactionCreate';

// export const searchTanksCommand = new Promise<CommandRegistry>((resolve) => {
//   resolve({
//     inProduction: true,
//     inPublic: true,

//     command: new SlashCommandBuilder()
//       .setName('search-tanks')
//       .setDescription('Search tanks')
//       .addStringOption((option) =>
//         addTankChoices(option).setAutocomplete(false),
//       )
//       .addIntegerOption((option) =>
//         option
//           .setName('limit')
//           .setDescription('The size of the search result (default: 25)')
//           .setMinValue(1)
//           .setMaxValue(100),
//       ),

//     async handler(interaction) {
//       const tank = interaction.options.getString('tank')!;
//       const limit = interaction.options.getInteger('limit') ?? 25;
//       const results = go(tank, await tankNames, {
//         limit,
//         keys: ['combined'],
//       }).map((result) => result.obj.original);

//       return embedInfo(
//         `Tank search for "${markdownEscape(tank)}"`,
//         results.length === 0
//           ? 'No tanks found.'
//           : `\`\`\`\n${results.join('\n')}\n\`\`\``,
//       );
//     },
//   });
// });
