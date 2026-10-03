export type StatTileTone = "brand" | "accent" | "neutral";

export interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
  tone?: StatTileTone;
}
