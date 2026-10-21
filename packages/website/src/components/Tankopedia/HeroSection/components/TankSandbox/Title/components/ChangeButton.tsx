import { LoopIcon } from "@radix-ui/react-icons";
import { Button, Dialog } from "@radix-ui/themes";
import { useState } from "react";
import { api } from "../../../../../../../core/blitzkit/api";
import { setProtagonist } from "../../../../../../../core/blitzkit/setProtagonist";
import { tankToDuelMember } from "../../../../../../../core/blitzkit/tankToDuelMember";
import { useLocale } from "../../../../../../../hooks/useLocale";
import { TankSearch } from "../../../../../../TankSearch";

const provisionDefinitions = await api.provisionDefinitions();

export function ChangeButton() {
  const [open, setOpen] = useState(false);
  const { strings } = useLocale();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button
          size="1"
          variant="surface"
          color="gray"
          highContrast
          style={{ pointerEvents: "auto" }}
        >
          <LoopIcon />
          {strings.website.tools.tankopedia.meta.change.button}
        </Button>
      </Dialog.Trigger>

      <Dialog.Content>
        <Dialog.Title align="center">
          {strings.website.tools.tankopedia.meta.change.title}
        </Dialog.Title>

        <TankSearch
          compact
          onSelect={(tank) => {
            setProtagonist(tankToDuelMember(tank, provisionDefinitions));
            setOpen(false);
          }}
        />
      </Dialog.Content>
    </Dialog.Root>
  );
}
