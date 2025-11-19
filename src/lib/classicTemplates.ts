
// src/lib/classicTemplates.ts
export type LayoutKey =
  | "BadgeSplit"
  | "DiagonalSplit"
  | "LeftBar"
  | "CircleSplit"
  | "MinimalCenter"
  | "GeoCorner"
  | "StripeAngled"
  | "MapPanel"
  | "HexBadge"
  | "ModernBlocks";

export type PatternKey = "topo" | "linen" | "dots" | "grid" | "waves" | "none";

export interface ClassicDesignConfig {
  id: string;
  name: string;
  layout: LayoutKey;
  bgStyle: "solid" | "gradient" | "pattern";
  bgColors: string[]; // 1 or 2
  textColor: string;
  accentColor: string;
  pattern?: PatternKey;
  fontFamily?: string;
  fontWeight?: "light" | "normal" | "bold";
  borderStyle?: "rounded" | "sharp" | "dashed";
 
  badgeColor?: string;
  metallic?: boolean;
  description?: string;
}


const baseThemes = [
  // [primary, secondary, accent, text]
  ["#0b1220", "#111827", "#D4AF37", "#ffffff"], // black + gold
  ["#071A52", "#0B3D91", "#60A5FA", "#ffffff"], // corporate blue
  ["#F8FAFD", "#E6EEF8", "#1E3A8A", "#0f172a"], // clean light
  ["#0b1220", "#1f2937", "#7c3aed", "#ffffff"], // dark violet
  ["#06202d", "#083344", "#06b6d4", "#ffffff"], // dark cyan
  ["#FFF7ED", "#FFEDD5", "#92400E", "#0f172a"], // warm gold light
  ["#ECFCCB", "#BBF7D0", "#065F46", "#0f172a"], // mint green
  ["#F3E8FF", "#D8B4FE", "#6D28D9", "#0f172a"], // purple pastel
  ["#FFF1F2", "#FFD6E0", "#9A1750", "#0f172a"], // pink
  ["#0f172a", "#0b1220", "#60a5fa", "#ffffff"], // navy modern
];

const layouts: LayoutKey[] = [
  "BadgeSplit",
  "DiagonalSplit",
  "LeftBar",
  "CircleSplit",
  "MinimalCenter",
  "GeoCorner",
  "StripeAngled",
  "MapPanel",
  "HexBadge",
  "ModernBlocks",
];

const patterns: PatternKey[] = ["topo", "linen", "dots", "grid", "waves", "none"];

function makeId(i: number) {
  return `template-${String(i + 1).padStart(3, "0")}`;
}

// generate 100 templates programmatically
export const classicTemplates: ClassicDesignConfig[] = (() => {
  const out: ClassicDesignConfig[] = [];
  for (let i = 0; i < 100; i++) {
    const themeIdx = i % baseThemes.length;
    const theme = baseThemes[themeIdx];
    const variant = Math.floor(i / baseThemes.length); // 0..9 roughly
    const layout = layouts[i % layouts.length];
    const pattern = patterns[(i * 3 + variant) % patterns.length];

    // small variations
    const metallic = (i % 11) === 0 || (themeIdx % 3 === 0 && variant % 2 === 0); // occasional metallics
    const borderStyle = ["rounded", "sharp", "dashed"][i % 3] as ClassicDesignConfig["borderStyle"];
    const fontWeight = ["light", "normal", "bold"][i % 3] as ClassicDesignConfig["fontWeight"];

    // choose colors rotated by variant for variety
    const primary = theme[(variant + 0) % 3];
    const secondary = theme[(variant + 1) % 3];
    const accent = theme[2];
    const textColor = theme[3];

    // alternate bgStyle for variety
    const bgStyle = i % 4 === 0 ? "solid" : i % 4 === 1 ? "gradient" : "pattern";

    out.push({
      id: makeId(i),
      name: `${layout} ${themeIdx + 1}-${variant + 1}`,
      layout,
      bgStyle,
      bgColors: bgStyle === "gradient" ? [primary, secondary] : [primary],
      textColor,
      accentColor: accent,
      pattern,
      fontFamily: variant % 2 === 0 ? "Inter, sans-serif" : "Playfair Display, serif",
      fontWeight,
      borderStyle,
      badgeColor: metallic ? "#D4AF37" : accent,
      metallic,
      description: `Layout ${layout} • Theme ${themeIdx + 1} • variant ${variant + 1}`,
    });
  }

  // Return full classic set like before (no curation/limiting)
  return out;
})();
