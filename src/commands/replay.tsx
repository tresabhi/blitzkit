import { createLocalizedCommand } from '../core/discord/createLocalizedCommand';
import { CommandRegistry } from '../events/interactionCreate';

type WotInspectorReplayResponse =
  | { status: 'error'; data: unknown; error: { message: string } }
  | {
      status: 'ok';
      data: {
        download_url: string;
        view_url: string;
        summary: {
          battle_start_time: string;
          map_name: string;
          battle_start_timestamp: number;
          battle_duration: number;
          title: string;
          arena_unique_id: string;
          allies: number[];
          enemies: number[];
          protagonist: number;
          player_name: string;
          vehicle: string;
          exp_base: number;
          exp_total: number;
          credits_base: number;
          credits_total: number;
          room_type: number;
          battle_type: number;
          mastery_badge: number;
          battle_result: number;
          vehicle_tier: number;
          vehicle_type: number;
          protagonist_team: number;
          winner_team: number;
          details: {
            achievements: unknown[];
            base_capture_points: number;
            base_defend_points: number;
            chassis_id: unknown | null;
            clan_tag: string;
            clanid: number;
            credits: number;
            damage_assisted: number;
            damage_assisted_track: number;
            damage_blocked: unknown | null;
            damage_made: number;
            damage_received: number;
            dbid: number;
            death_reason: number;
            distance_travelled: number;
            enemies_damaged: number;
            enemies_destroyed: number;
            enemies_spotted: number;
            entity_id: number;
            exp: number;
            exp_for_assist: number;
            exp_for_damage: number;
            exp_team_bonus: number;
            gun_id: unknown | null;
            hero_bonus_credits: number;
            hero_bonus_exp: number;
            hitpoints_left: number;
            hits_bounced: number;
            hits_pen: number;
            hits_received: number;
            hits_splash: number;
            killed_by: number;
            name: string;
            shots_hit: number;
            shots_made: number;
            shots_pen: number;
            shots_splash: number;
            squad_index: number;
            team: number;
            time_alive: number;
            turret_id: unknown | null;
            vehicle_descr: number;
            wp_points_earned: number;
            wp_points_stolen: number;
          };
        };
      };
      error: {};
    };

export const replayCommand = new Promise<CommandRegistry>((resolve) => {
  resolve({
    inProduction: true,
    inPublic: true,
    command: createLocalizedCommand('replay').addAttachmentOption((option) =>
      option.setName('file').setDescription('Replay file').setRequired(true),
    ),

    async handler(interaction) {
      const file = interaction.options.getAttachment('file')!;
      const url = `https://wotinspector.com/api/replay/upload/?url=${encodeURIComponent(
        file.url,
      )}`;
      const response = await fetch(url);
      const replay = (await response.json()) as WotInspectorReplayResponse;

      if (replay.status === 'error') {
        return `# Uh oh! WoTInspoec`
      }

      return await response.text();
    },
  });
});
