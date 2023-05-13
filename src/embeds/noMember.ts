import errorEmbed from './errorEmbed.js';

export const noMember = errorEmbed(
  'User of command is not a member',
  'Discord claims that the user of this command does not have an account... strange!',
);
