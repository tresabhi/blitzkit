import { isExplosive } from "@blitzkit/core";
import { useRef, useState } from "react";
import { degToRad } from "three/src/math/MathUtils.js";
import type { ToyProps } from "../../config/toys";
import { DuelModule, useDuel } from "../../hooks/useDuel";
import { useStrings } from "../../hooks/useStrings";

export function RicochetToy({ characteristics }: ToyProps) {
  const strings = useStrings();

  const shell = useDuel("protagonist", DuelModule.Shell);

  const container = useRef<HTMLDivElement>(null);

  const normalization = degToRad(
    (characteristics.get("normalization") as number) ?? 0,
  );
  const ricochet = degToRad((characteristics.get("ricochet") as number) ?? 90);
  const explodes = isExplosive(shell.type);

  const [rawAngle, setAngle] = useState(degToRad(-25));

  const angle = explodes ? degToRad(-70) : rawAngle;
  const doesRicochet = Math.abs(angle) >= ricochet;
  const effectiveAngle = doesRicochet
    ? -angle + Math.PI
    : Math.sign(angle) * Math.max(0, Math.abs(angle) - normalization);

  const armorPercentage = Math.min(999, 100 / Math.cos(effectiveAngle));

  return (
    <Box
      onPointerMove={(event) => {
        event.preventDefault();

        if (!container.current || explodes) return;

        const rect = container.current.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 3;
        const y = event.clientY - rect.top - rect.height / 2;
        const angle = clamp(Math.atan2(-y, x), -Math.PI / 2, Math.PI / 2);

        setAngle(angle);
      }}
    >
      <Box
        width="33%"
        height="100%"
        position="absolute"
        top="0"
        left="0"
        style={{
          background: `linear-gradient(to right, transparent, ${Var("gray-a4")})`,
        }}
      >
        <Box
          width="100%"
          height="100%"
          style={{
            opacity: 2 ** -3,
            backgroundImage: `url(/assets/images/tankopedia/visualizers/ricochet/armor-hash.png)`,
          }}
        />
      </Box>

      <Box
        left="33%"
        top="0"
        width="67%"
        height="100%"
        position="absolute"
        style={{
          background: `conic-gradient(
              at 0 50%,

              ${Var("ruby-a2")},
              ${Var("ruby-a1")} ${Math.PI / 2 - ricochet}rad,

              ${Var("jade-a2")} ${Math.PI / 2 - ricochet}rad,
              ${Var("jade-a4")} ${Math.PI / 2 - normalization}rad,

              ${Var("cyan-a5")} ${Math.PI / 2 - normalization}rad,
              ${Var("cyan-a3")} ${Math.PI / 2 + normalization}rad,

              ${Var("jade-a2")} ${Math.PI / 2 + normalization}rad,
              ${Var("jade-a4")} ${Math.PI / 2 + ricochet}rad,

              ${Var("ruby-a1")} ${Math.PI / 2 + ricochet}rad,
              ${Var("ruby-a2")} 180deg
            `,
        }}
      />

      <Box
        position="absolute"
        left="33%"
        top="50%"
        height="18rem"
        style={{
          transformOrigin: "top center",
          transform: `translateX(-50%) rotate(${-Math.PI / 2 - angle}rad)`,
        }}
      >
        <Box
          position="absolute"
          width="1px"
          height="100%"
          bottom="100%"
          style={{
            transform: "translateX(-50%)",
            backgroundColor: Var("gray-a8"),
          }}
        />
        <Box
          position="absolute"
          width="3px"
          height="100%"
          style={{
            transform: "translateX(-50%)",
            background: `linear-gradient(${Var("gray-a11")}, ${Var("gray-a4")})`,
          }}
        />

        <img
          src={alias("api", `/icons/shells/${shell.icon}.webp`)}
          style={{
            objectFit: "contain",
            transform: "translate(-50%, -50%) rotate(-45deg)",
            position: "absolute",
            width: "2rem",
            height: "2rem",
            top: "6rem",
            left: 0,
            filter: "drop-shadow(0px 0px 0.25rem black)",
          }}
        />
      </Box>

      <Box
        position="absolute"
        left="33%"
        top="50%"
        height="16rem"
        style={{
          transformOrigin: "top center",
          transform: `translateX(-50%) rotate(${-Math.PI / 2 - effectiveAngle}rad)`,
        }}
      >
        <Box
          position="absolute"
          width="3px"
          height="100%"
          top="-100%"
          style={{
            transform: "translateX(-50%)",
            background: `linear-gradient(${Var("gray-a4")}, ${Var("gray-a11")})`,
          }}
        />
      </Box>

      <VisualizerCornerStat
        label={strings.website.tools.tankopedia.visualizers.ricochet.angle}
        value={literals(strings.common.units.deg, {
          value: radToDeg(Math.abs(angle)).toFixed(0),
        })}
        side="top-left"
      />
      <VisualizerCornerStat
        label={
          strings.website.tools.tankopedia.visualizers.ricochet.normalization
        }
        value={
          doesRicochet
            ? "-"
            : literals(strings.common.units.deg, {
                value: radToDeg(
                  Math.min(normalization, Math.abs(angle)),
                ).toFixed(0),
              })
        }
        side="top-right"
      />
      <VisualizerCornerStat
        label={
          strings.website.tools.tankopedia.visualizers.ricochet.effective_angle
        }
        value={
          doesRicochet
            ? "-"
            : literals(strings.common.units.deg, {
                value: radToDeg(Math.abs(effectiveAngle)).toFixed(0),
              })
        }
        side="bottom-left"
      />
      <VisualizerCornerStat
        label={strings.website.tools.tankopedia.visualizers.ricochet.armor}
        value={
          doesRicochet
            ? "-"
            : literals(strings.common.units.percentage, {
                value: armorPercentage.toFixed(0),
              })
        }
        side="bottom-right"
      />

      {explodes && (
        <Flex
          p="3"
          justify="center"
          align="center"
          height="100%"
          width="100%"
          position="absolute"
          top="0"
          left="0"
          style={{
            background: `radial-gradient(${Var("black-a7")}, ${Var("black-a11")})`,
          }}
        >
          <Text color="gray" align="center">
            {strings.website.tools.tankopedia.visualizers.ricochet.no_ricochet}
          </Text>
        </Flex>
      )}
    </Box>
  );
}
