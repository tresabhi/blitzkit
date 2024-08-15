import { readYAMLDVPL } from '../../src/core/blitz/readYAMLDVPL';
import { DATA } from './constants';
import { SquadBattleTypeUI } from './definitions';

// enum EGameMode {
//   Rating = 7,
//   Scuffle = 22,
// }

export async function gameModeIcons(production: boolean) {
  const squadBattleTypeUI = await readYAMLDVPL<SquadBattleTypeUI>(
    `${DATA}/UI/Screens3/Lobby/Hangar/Squad/SquadBattleType.yaml.dvpl`,
  );

  for (const match of squadBattleTypeUI.Prototypes[0].components.UIDataLocalBindingsComponent.data[0][2].matchAll(
    /"(\d+)" -> "(battleType\/[a-zA-Z]+)"/g,
  )) {
    const id = Number(match[1]);

    // gameDefinitions.gameModes[id] = {
    //   name,
    // };
  }
}
