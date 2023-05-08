import errorEmbed from '../utilities/errorEmbed.js';

export const badNicknameFormat = errorEmbed(
  'Bad nickname format',
  'I expected your nickname to be... \n\n```\nIN_GAME_NAME (SERVER) [CLAN_TAG]\n```\nUse the `/verify` command to setup your nickname correctly or manually provide me with your in-game name and server in the command.',
);
