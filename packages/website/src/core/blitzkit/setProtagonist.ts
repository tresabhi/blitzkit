import { Duel, type DuelMember } from "../../stores/duel";
import { Tankopedia } from "../../stores/tankopedia";
import { api } from "./api";

const modelDefinitions = await api.modelDefinitions();

export function setProtagonist(
  protagonist: DuelMember,
  antagonist = Duel.state.antagonist,
) {
  const sameTank = protagonist.tank.id === Duel.state.protagonist.tank.id;

  Duel.mutate((draft) => {
    draft.protagonist = protagonist;
    draft.antagonist = antagonist;
  });
  Tankopedia.mutate((draft) => {
    draft.model = modelDefinitions.models[protagonist.tank.id];
    draft.revealed = sameTank;
    draft.shot = undefined;
    draft.highlightArmor = undefined;
    draft.customShell = undefined;
  });
}
