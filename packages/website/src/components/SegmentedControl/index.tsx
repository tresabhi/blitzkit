import { type ReactNode } from "react";
import styles from "./index.module.css";

export interface SegmentedControlOption<Value extends string | number> {
  value: Value;
  label: ReactNode;
}

export interface SegmentedControlProps<Value extends string | number> {
  options: readonly SegmentedControlOption<Value>[];
  value: Value;
  onValueChange(value: Value): void;
}

export function SegmentedControl<Value extends string | number>({
  options,
  value,
  onValueChange,
}: SegmentedControlProps<Value>) {
  const selectedIndex = options.findIndex((option) => option.value === value);
  const segmentWidth = 100 / options.length;

  return (
    <div
      className={styles.options}
      role="radiogroup"
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      <div
        className={styles.indicator}
        style={{
          left: `${Math.max(selectedIndex, 0) * segmentWidth}%`,
          width: `${segmentWidth}%`,
        }}
        aria-hidden="true"
      />

      {options.map((option) => (
        <label className={styles.option} key={option.value}>
          <input
            type="radio"
            value={option.value}
            checked={option.value === value}
            onChange={() => onValueChange(option.value)}
          />
          <span className={styles.label}>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
