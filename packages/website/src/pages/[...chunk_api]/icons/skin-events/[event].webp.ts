import type { APIContext } from "astro";
import sharp from "sharp";
import { extractPackedIcon } from "../../../../core/blitz/extractPackedIcon";
import { parsePackedSpriteRect } from "../../../../core/blitz/parsePackedSpriteRect";
import { mixStaticPaths } from "../../../../core/blitzkit/mixStaticPaths";
import { vfs } from "../../../../core/blitzkit/vfs";
import { getStaticPaths as _getStaticPaths } from "../../_index";

interface Icon {
  path: string;
  /** sprite inside a texture0 atlas described by a .txt file */
  atlas: boolean;
}

// white game icons for the camo animation triggers
const ICONS: Record<string, Icon> = {
  garage: { path: "Lobby/icons/platoon/icon_hangar_m", atlas: false },
  shoot: { path: "UI/BattleScreenHUD/icon_aim-battle_m", atlas: true },
  kill: {
    path: "UI/BattleScreenHUD/icon_battle-chat_kill-type_default",
    atlas: true,
  },
  damage: { path: "UI/BattleScreenHUD/icon_damage_shadow_m", atlas: true },
  damage_enemy: {
    path: "UI/BattleScreenHUD/icon_attack-battle_m",
    atlas: true,
  },
  no_pierce: {
    path: "UI/BattleScreenHUD/icon_shooting-fb_shield_m",
    atlas: true,
  },
  move: { path: "Lobby/icons/icon_speed_s", atlas: false },
  consumable: { path: "Lobby/icons/icon_consumable_l", atlas: false },
  reload: { path: "Lobby/icons/icon_rate-of-fire_s", atlas: false },
};

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () =>
  Object.keys(ICONS).map((event) => ({ params: { event }, props: { event } })),
);

export async function GET({ props }: APIContext<{ event: string }>) {
  const { path, atlas } = ICONS[props.event];
  let buffer: Buffer;

  if (atlas) {
    const directory = path.split("/").slice(0, -1).join("/");
    const sizes = (await vfs.text(`Data/Gfx/${path}@2x.txt`))
      .split("\n")[4]
      .trim()
      .split(" ")
      .map(Number);

    buffer = await extractPackedIcon(
      sharp(await vfs.file(`Data/Gfx/${directory}/texture0@2x.packed.webp`)),
      sizes.slice(0, 4),
    );
  } else {
    const packedBuffer = await vfs.file(`Data/Gfx/${path}@2x.packed.webp`);
    const sizes = parsePackedSpriteRect(packedBuffer);

    buffer = sizes
      ? await extractPackedIcon(sharp(packedBuffer), sizes)
      : packedBuffer;
  }

  return new Response(new Uint8Array(await sharp(buffer).webp().toBuffer()));
}
