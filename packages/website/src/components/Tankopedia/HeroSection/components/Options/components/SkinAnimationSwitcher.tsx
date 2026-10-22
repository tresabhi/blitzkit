import { alias } from "@blitzkit/core";
import type { BlitzKitStrings } from "@blitzkit/i18n";
import { Flex, Tooltip } from "@radix-ui/themes";
import { GARAGE_EVENT } from "../../../../../../core/blitzkit/skinAnimations/runtime";
import { useLocale } from "../../../../../../hooks/useLocale";
import { skinAnimationEvent } from "../../../../../../hooks/useSkinAnimation";
import { Tankopedia } from "../../../../../../stores/tankopedia";
import { TankopediaDisplay } from "../../../../../../stores/tankopediaPersistent/constants";
import { SidebarIconButton } from "./SidebarIconButton";

type SkinEventGroup =
  keyof BlitzKitStrings["website"]["tools"]["tankopedia"]["sandbox"]["skin_events"];

// the camo column is one button wide
const SKIN_COLUMN_OFFSET = {
  initial: "calc(var(--space-3) + 40px + var(--space-2))",
  sm: "calc(var(--space-3) + 48px + var(--space-2))",
};

// icons are served from /icons/skin-events/[group].webp
const SKIN_EVENT_GROUPS: {
  group: SkinEventGroup;
  events: string[];
}[] = [
  { group: "garage", events: [GARAGE_EVENT] },
  {
    group: "shoot",
    events: ["OnShoot", "OnShootFirstInBurst", "OnShootFirstInBurstSniper"],
  },
  {
    group: "kill",
    events: [
      "KillEnemy",
      "KillEnemyAmmoBayDestroyed",
      "KillEnemyRam",
      "OnKillEnemyAmmoBayDestroyed",
      "OnKillEnemyRam",
    ],
  },
  { group: "damage", events: ["PlayerHasDamageFromEnemy"] },
  { group: "damage_enemy", events: ["AttackerDamagedEnemy"] },
  // camos play the same animation for both
  {
    group: "no_pierce",
    events: ["AttackerDidNotPierceEnemy", "AttackerRichochetEmeny"],
  },
  { group: "move", events: ["OnStartMovement"] },
  {
    group: "consumable",
    events: [
      "ConsumableUsedAfterburning",
      "ConsumableUsedFreeAfterburning",
      "ConsumableUsedAbilityAfterburning",
      "ConsumableUsedImprovedAfterburning",
    ],
  },
  { group: "reload", events: ["ReloadStarted"] },
];

export function SkinAnimationSwitcher() {
  const { strings } = useLocale();
  const skinEvents = Tankopedia.use((state) => state.skinEvents);
  const disturbed = Tankopedia.use((state) => state.disturbed);
  const requestedDisplay = Tankopedia.use((state) => state.requestedDisplay);
  // one animation at a time; overlapping triggers look broken
  const disabled = Tankopedia.use((state) => state.skinAnimating);
  const groups = SKIN_EVENT_GROUPS.flatMap(({ events, ...group }) => {
    // the first event the camo listens to stands in for its group
    const event = events.find((event) => skinEvents.includes(event));

    return event ? [{ ...group, event }] : [];
  });
  // replaying the garage animation sits apart from the battle triggers
  const sections = [
    groups.filter(({ group }) => group === "garage"),
    groups.filter(({ group }) => group !== "garage"),
  ].filter((section) => section.length > 0);
  const visible =
    disturbed &&
    requestedDisplay === TankopediaDisplay.Model &&
    groups.length > 0;

  return (
    <Flex
      direction="column"
      gap="3"
      top="50%"
      right={visible ? SKIN_COLUMN_OFFSET : "-4rem"}
      style={{
        position: "absolute",
        transform: "translateY(-50%)",
        transitionDuration: "200ms",
        pointerEvents: "auto",
      }}
    >
      {sections.map((section) => (
        <Flex key={section[0].group} direction="column">
          {section.map(({ group, event }, index) => {
            const name =
              strings.website.tools.tankopedia.sandbox.skin_events[group];
            const top = index === 0 ? "var(--radius-full)" : "0";
            const bottom =
              index === section.length - 1 ? "var(--radius-full)" : "0";

            return (
              <Tooltip key={group} content={name} side="left">
                <SidebarIconButton
                  selected={false}
                  alt={name}
                  src={alias("api", `/icons/skin-events/${group}.webp`)}
                  size={{ initial: "3", sm: "4" }}
                  radius="full"
                  style={{
                    borderRadius: `${top} ${top} ${bottom} ${bottom}`,
                  }}
                  disabled={disabled}
                  imageStyle={{
                    objectFit: "contain",
                    opacity: disabled ? 0.4 : 1,
                    transition: "opacity 200ms",
                  }}
                  onClick={() => skinAnimationEvent.dispatch(event)}
                />
              </Tooltip>
            );
          })}
        </Flex>
      ))}
    </Flex>
  );
}
