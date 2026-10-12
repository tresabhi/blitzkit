import { alias, isExplosive } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { clamp, degToRad, radToDeg } from "three/src/math/MathUtils.js";
import type { ToyProps } from "../../config/toys";
import { DuelModule, useDuel } from "../../hooks/useDuel";
import { useStrings } from "../../hooks/useStrings";
import type { ComputedCharacteristics } from "../../types/characteristics";
import { Checkbox } from "../Checkbox";
import { Code } from "../Code";
import { SegmentedControl } from "../SegmentedControl";
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
        label={strings.tanks.toys.ricochet.angle}
        value={literals(strings.common.units.deg, {
          value: radToDeg(Math.abs(angle)).toFixed(0),
        })}
        position={CornerStatPosition.TopLeft}
      />
      <CornerStat
        label={strings.tanks.toys.ricochet.normalization}
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
        label={strings.tanks.toys.ricochet.effective}
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
        label={strings.tanks.toys.ricochet.armor}
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
          {strings.tanks.toys.ricochet.no_ricochet}
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

const terrains = ["hard", "medium", "soft"] as const;
type Terrain = (typeof terrains)[number];

interface TraverseToyProps {
  characteristics: ComputedCharacteristics;
}

export function TraverseToy({ characteristics }: TraverseToyProps) {
  const hull = useRef<HTMLDivElement>(null);
  const turret = useRef<HTMLImageElement>(null);

  const [terrain, setTerrain] = useState<Terrain>("hard");
  const [rotateHull, setRotateHull] = useState(true);
  const [rotateTurret, setRotateTurret] = useState(true);

  const turretAngle = useRef(0);
  const hullAngle = useRef(0);

  const strings = useStrings();

  const hullSpeed = characteristics.get(
    `hull_traverse_speed_${terrain}`,
  ) as number;
  const turretTraverseSpeed = characteristics.get(
    "turret_traverse_speed",
  ) as number;

  const turretSpeed = rotateTurret ? turretTraverseSpeed : 0;
  const hullSpeedEffective = rotateHull ? hullSpeed : 0;

  const isTurretless =
    characteristics.has("azimuth_left") || characteristics.has("azimuth_right");

  useEffect(() => {
    let cancel = false;
    const turretSpeedRad = (turretSpeed * Math.PI) / 180;
    const hullSpeedRad = (hullSpeedEffective * Math.PI) / 180;
    let lastT = Date.now() / 1000;

    function frame() {
      const t = Date.now() / 1000;
      const dt = t - lastT;
      lastT = t;

      if (turret.current) {
        turretAngle.current =
          (turretAngle.current + turretSpeedRad * dt) % (2 * Math.PI);
        turret.current.style.transform = `translate(-50%, -50%) rotate(${-turretAngle.current}rad)`;
      }

      if (hull.current) {
        hullAngle.current =
          (hullAngle.current + hullSpeedRad * dt) % (2 * Math.PI);
        hull.current.style.transform = `translate(-50%, -50%) rotate(${-hullAngle.current}rad)`;
      }

      if (!cancel) requestAnimationFrame(frame);
    }

    frame();

    return () => {
      cancel = true;
    };
  }, [hullSpeedEffective, turretSpeed]);

  const terrainOptions = terrains.map((terrain) => ({
    value: terrain,
    label:
      strings.tanks.characteristics.items[`hull_traverse_speed_${terrain}`],
  }));

  return (
    <div className={styles["traverse-visualizer"]}>
      <div
        ref={hull}
        className={styles["traverse-hull"]}
        data-turretless={isTurretless}
      >
        <img
          draggable="false"
          className={styles["traverse-hull-image"]}
          src={`/media/toys/hull${isTurretless ? "-only" : ""}.png`}
        />

        {!isTurretless && (
          <img
            draggable="false"
            ref={turret}
            className={styles["traverse-turret"]}
            src="/media/toys/turret.png"
          />
        )}
      </div>

      <div className={styles["traverse-toggles"]}>
        {!isTurretless && (
          <>
            <Checkbox checked={rotateHull} onCheckedChange={setRotateHull}>
              {strings.tanks.toys.traverse.hull}
            </Checkbox>
            <Checkbox checked={rotateTurret} onCheckedChange={setRotateTurret}>
              {strings.tanks.toys.traverse.turret}
            </Checkbox>
          </>
        )}
      </div>

      <div className={styles["traverse-terrain"]}>
        <SegmentedControl
          options={terrainOptions}
          value={terrain}
          onValueChange={(value) => {
            const nextTerrain = terrains.find((terrain) => terrain === value);
            if (nextTerrain) setTerrain(nextTerrain);
          }}
          variant="underline"
        />
      </div>

      <div className={styles["traverse-effective"]}>
        <span>{strings.tanks.toys.traverse.effective}</span>
        <Code size="minor">
          {literals(strings.units.deg_s, {
            value: (turretSpeed + hullSpeedEffective).toFixed(1),
          })}
        </Code>
      </div>
    </div>
  );
}
