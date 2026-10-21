import { UpdateIcon } from "@radix-ui/react-icons";
import { Button } from "@radix-ui/themes";
import { setProtagonist } from "../../../../../../../core/blitzkit/setProtagonist";
import { useLocale } from "../../../../../../../hooks/useLocale";
import { Duel } from "../../../../../../../stores/duel";

export function SwapButton() {
  const { strings } = useLocale();

  return (
    <Button
      size="1"
      variant="surface"
      color="gray"
      highContrast
      style={{ pointerEvents: "auto" }}
      onClick={() => {
        const { protagonist, antagonist } = Duel.state;
        setProtagonist(antagonist, protagonist);
      }}
    >
      <UpdateIcon />
      {strings.website.tools.tankopedia.meta.swap.button}
    </Button>
  );
}
