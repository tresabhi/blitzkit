import { alias, isExplosive } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { clamp, degToRad, radToDeg } from "three/src/math/MathUtils.js";
import type { ToyProps } from "../../config/toys";
import { DuelModule, useDuel } from "../../hooks/useDuel";
import { useStrings } from "../../hooks/useStrings";
import { Code } from "../Code";
import styles from "./index.module.css";

export function RicochetToy({ characteristics }: ToyProps) {
  const strings = useStrings();
  const shell = useDuel("protagonist", DuelModule.Shell);
  const container = useRef<HTMLDivElement>(null);
  const normalizationValue = characteristics.get("normalization");
  const ricochetValue = characteristics.get("ricochet");
  const normalization = degToRad(
    typeof normalizationValue === "number" ? normalizationValue : 0,
  );
  const ricochet = degToRad(
    typeof ricochetValue === "number" ? ricochetValue : 90,
  );
  const explodes = isExplosive(shell.type);
  const [rawAngle, setAngle] = useState(degToRad(-25));
  const angle = explodes ? degToRad(-70) : rawAngle;
  const doesRicochet = Math.abs(angle) >= ricochet;
  const effectiveAngle = doesRicochet
    ? -angle + Math.PI
    : Math.sign(angle) * Math.max(0, Math.abs(angle) - normalization);
  const armorPercentage = Math.min(999, 100 / Math.cos(effectiveAngle));

  function updateAngle(event: PointerEvent<HTMLDivElement>) {
    event.preventDefault();

    if (!container.current || explodes) return;

    const rect = container.current.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 3;
    const y = event.clientY - rect.top - rect.height / 2;

    setAngle(clamp(Math.atan2(-y, x), -Math.PI / 2, Math.PI / 2));
  }

  return (
    <div
      ref={container}
      className={styles.visualizer}
      onPointerMove={updateAngle}
    >
      <div className={styles.armor}>
        <div className={styles["armor-texture"]} />
      </div>

      <div
        className={styles.zones}
        style={
          {
            "--normalization-angle": `${normalization}rad`,
            "--ricochet-angle": `${ricochet}rad`,
          } as CSSProperties
        }
      />

      <div
        className={styles["shell-path"]}
        style={
          {
            "--rotation-angle": `${-Math.PI / 2 - angle}rad`,
          } as CSSProperties
        }
      >
        <div className={styles["shell-path-extension"]} />
        <div className={styles["shell-path-line"]} />
        <img
          className={styles.shell}
          alt=""
          src={alias("api", `/icons/shells/${shell.icon}.webp`)}
        />
      </div>

      <div
        className={styles["effective-path"]}
        style={
          {
            "--rotation-angle": `${-Math.PI / 2 - effectiveAngle}rad`,
          } as CSSProperties
        }
      >
        <div className={styles["effective-path-line"]} />
      </div>

      <CornerStat
        label={strings.tanks.characteristics.toys.ricochet.angle}
        value={literals(strings.common.units.deg, {
          value: radToDeg(Math.abs(angle)).toFixed(0),
        })}
        position={CornerStatPosition.TopLeft}
      />
      <CornerStat
        label={strings.tanks.characteristics.toys.ricochet.normalization}
        value={
          doesRicochet
            ? "-"
            : literals(strings.common.units.deg, {
                value: radToDeg(
                  Math.min(normalization, Math.abs(angle)),
                ).toFixed(0),
              })
        }
        position={CornerStatPosition.TopRight}
      />
      <CornerStat
        label={strings.tanks.characteristics.toys.ricochet.effective}
        value={
          doesRicochet
            ? "-"
            : literals(strings.common.units.deg, {
                value: radToDeg(Math.abs(effectiveAngle)).toFixed(0),
              })
        }
        position={CornerStatPosition.BottomLeft}
      />
      <CornerStat
        label={strings.tanks.characteristics.toys.ricochet.armor}
        value={
          doesRicochet
            ? "-"
            : literals(strings.common.units.percentage, {
                value: armorPercentage.toFixed(0),
              })
        }
        position={CornerStatPosition.BottomRight}
      />

      {explodes && (
        <div className={styles["explosive-overlay"]}>
          {strings.tanks.characteristics.toys.ricochet.no_ricochet}
        </div>
      )}
    </div>
  );
}

enum CornerStatPosition {
  TopLeft = "top-left",
  TopRight = "top-right",
  BottomLeft = "bottom-left",
  BottomRight = "bottom-right",
}

interface CornerStatProps {
  label: string;
  value: string;
  position: CornerStatPosition;
}

function CornerStat({ label, value, position }: CornerStatProps) {
  return (
    <div className={styles["corner-stat"]} data-position={position}>
      <span>{label}</span>
      <Code className={styles["corner-stat-value"]} size="minor">
        {value}
      </Code>
    </div>
  );
}
