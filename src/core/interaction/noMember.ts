import negativeEmbed from './negativeEmbed.js';

export const noMember = negativeEmbed(
  'User of command is not a member',
  'Discord claims that the user of this command does not have an account... strange!',
);
