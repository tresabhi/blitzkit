import { SlashCommandStringOption } from 'discord.js';

export const STAT_PROPERTIES = [
  { name: 'Time', value: 'time' },

  { name: 'Battles', value: 'battles' },
  { name: 'Maximum XP', value: 'max_xp' },
  { name: 'Maximum kills', value: 'max_frags' },

  { name: 'Accumulated spots', value: 'spotted' },
  { name: 'Accumulated hits', value: 'hits' },
  { name: 'Accumulated kills', value: 'frags' },
  { name: 'Accumulated wins', value: 'wins' },
  { name: 'Accumulated losses', value: 'losses' },
  { name: 'Accumulated capture points', value: 'capture_points' },
  { name: 'Accumulated damage dealt', value: 'damage_dealt' },
  { name: 'Accumulated damage received', value: 'damage_received' },
  { name: 'Accumulated shots', value: 'shots' },
  { name: 'Accumulated kills above tier 8', value: 'frags8p' },
  { name: 'Accumulated XP', value: 'xp' },
  {
    name: 'Accumulated won and survived battles',
    value: 'win_and_survived',
  },
  { name: 'Accumulated survived battles', value: 'survived_battles' },
  {
    name: 'Accumulated dropped capture points',
    value: 'dropped_capture_points',
  },

  { name: 'Average spots', value: 'average_spotted' },
  { name: 'Average hits', value: 'average_hits' },
  { name: 'Average kills', value: 'average_frags' },
  { name: 'Average winrate', value: 'average_wins' },
  { name: 'Average loss rate', value: 'average_losses' },
  { name: 'Average capture points', value: 'average_capture_points' },
  { name: 'Average damage dealt', value: 'average_damage_dealt' },
  { name: 'Average damage received', value: 'average_damage_received' },
  { name: 'Average shots', value: 'average_shots' },
  { name: 'Average kills above tier 8', value: 'average_frags8p' },
  { name: 'Average XP', value: 'average_xp' },
  {
    name: 'Average win and survival rate',
    value: 'average_win_and_survived',
  },
  { name: 'Average survival rate', value: 'average_survived_battles' },

  { name: 'Average WN8', value: 'average_wn8' },
  { name: 'Average damage ratio', value: 'average_damage_ratio' },
  {
    name: 'Average kills to death ratio',
    value: 'average_kills_to_death_ratio',
  },
];

export function addStatPropertyOptions(option: SlashCommandStringOption) {
  return option
    .setName('stat-property')
    .setDescription('A specific statistical property')
    .setAutocomplete(true);
}
