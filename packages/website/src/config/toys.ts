import type { ReactNode } from "react";
import { RicochetToy, TraverseToy } from "../components/TankopediaToys";
import type { ComputedCharacteristics } from "../types/characteristics";

export interface ToyProps {
  characteristics: ComputedCharacteristics;
}

export const toys: Record<string, (props: ToyProps) => ReactNode> = {
  ricochet: RicochetToy,
  traverse: TraverseToy,
};
