import type { ReactNode } from "react";
import { RicochetToy } from "../components/TankopediaToys";
import type { ComputedCharacteristics } from "../types/characteristics";

export interface ToyProps {
  characteristics: ComputedCharacteristics;
}

export const toys: Record<string, (props: ToyProps) => ReactNode> = {
  ricochet: RicochetToy,
};
