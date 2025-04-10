import sharp from 'sharp';
import { readDVPLFile } from '../../src/core/blitz/readDVPLFile';
import { readYAMLDVPL } from '../core/blitz/readYAMLDVPL';
import { commitAssets } from '../core/github/commitAssets';
import { FileChange } from '../core/github/commitMultipleFiles';
import { DATA } from './constants';
import { SquadBattleTypeStyles } from './definitions';

export async function gameModeBanners() {
  console.log('Building game mode banners...');

  const changes: FileChange[] = [];
  const gameTypeSelectorStyles = await readYAMLDVPL<SquadBattleTypeStyles>(
    `${DATA}/UI/Screens/Lobby/Hangar/GameTypeSelector.yaml`,
  );
  const squadBattleTypeStyles = await readYAMLDVPL<SquadBattleTypeStyles>(
    `${DATA}/UI/Screens3/Lobby/Hangar/Squad/SquadBattleType.yaml`,
  );
  const bannerMatches: { name: string; path: string }[] = [];

  for (const match of gameTypeSelectorStyles.Prototypes[0].components.UIDataLocalBindingsComponent.data[1][2].matchAll(
    /eGameMode\.([a-zA-Z]+) -> "~res:([^"]+)"/g,
  )) {
    bannerMatches.push({ name: match[1], path: match[2] });
  }

  for (const match of squadBattleTypeStyles.Prototypes[0].components.UIDataLocalBindingsComponent.data[1][2].matchAll(
    /"(\d+)" -> "battleType\/([a-zA-Z]+)"/g,
  )) {
    const id = Number(match[1]);
    const name = match[2];
    let path = bannerMatches.find(
      (bannerMatch) => bannerMatch.name.toLowerCase() === name.toLowerCase(),
    )?.path;

    if (path === undefined) {
      path = `/Gfx/UI/Hangar/GameTypes/battle-type_${name.toLowerCase()}`;
    }

    const content = await sharp(
      await readDVPLFile(`${DATA}${path}.packed.webp`),
    )
      .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    changes.push({
      path: `icons/game_mode_banners/${id}.webp`,
      content,
    });
  }

  await commitAssets('game mode banners', changes);
}
