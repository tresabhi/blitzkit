import { SlashCommandStringOption } from 'discord.js';

export type StatPeriod = 'today' | '30' | '60' | '90' | 'career';
export const statPeriodNames: Record<StatPeriod, string> = {
  today: "Today's statistics",
  30: '30-day statistics',
  60: '60-day statistics',
  90: '90-day statistics',
  career: 'Career statistics',
};
export default function addPeriodChoices(option: SlashCommandStringOption) {
  return option
    .setName('period')
    .setDescription('The period to get stats for')
    .setChoices(
      { name: 'Today', value: 'today' satisfies StatPeriod },
      { name: '30 Days', value: '30' satisfies StatPeriod },
      { name: '60 Days', value: '60' satisfies StatPeriod },
      { name: '90 Days', value: '90' satisfies StatPeriod },
      { name: 'Career', value: 'career' satisfies StatPeriod },
    )
    .setRequired(true);
}
